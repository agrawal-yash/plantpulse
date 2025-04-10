import torch
from torchvision import transforms
from PIL import Image
from transformers import ViTForImageClassification
import torch.nn.functional as F
import numpy as np

# Load class labels
with open("utils/class_labels.txt", "r") as f:
    class_labels = [line.strip() for line in f]

# Initialize model using transformers with ignore_mismatched_sizes=True
model = ViTForImageClassification.from_pretrained(
    'google/vit-base-patch16-224',
    num_labels=len(class_labels),
    ignore_mismatched_sizes=True
)
state_dict = torch.load('models/best_model.pth', map_location='cpu')
model.load_state_dict(state_dict)
model.eval()

# Define transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

def is_leaf_image(image):
    """
    Check if the image likely contains a leaf based on color properties.
    This is a simple heuristic based on the amount of green pixels in the image.
    """
    # Convert image to numpy array
    img_array = np.array(image)
    
    # Convert to HSV color space which is better for color detection
    if len(img_array.shape) == 3:  # Check if image is colored
        # Calculate the green ratio
        # In RGB, green channel is higher than red and blue for most leaves
        green_pixels = 0
        total_pixels = img_array.shape[0] * img_array.shape[1]
        
        # A simple heuristic: check if green channel is dominant
        # and within certain range for leaf coloration
        for i in range(img_array.shape[0]):
            for j in range(img_array.shape[1]):
                r, g, b = img_array[i, j]
                # Green is typically higher in leaves
                if g > r and g > b and g > 30:
                    green_pixels += 1
        
        green_ratio = green_pixels / total_pixels
        
        # If at least 15% of pixels are leaf-like green, consider it a leaf image
        return green_ratio > 0.15
    
    return False

def predict(image_path):
    image = Image.open(image_path).convert('RGB')
    return predict_from_image(image)

def predict_from_image(image):
    """Function to predict from an already opened PIL Image"""
    # Check if the image contains a leaf
    if not is_leaf_image(image):
        return {
            "is_valid_leaf": False,
            "error": "No leaf detected in the image. Please upload an image containing plant leaves."
        }
    
    image_tensor = transform(image).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(image_tensor)
        logits = outputs.logits
        probabilities = F.softmax(logits, dim=1)[0]
        
        # Get top 3 predictions with their probabilities
        top_probs, top_indices = torch.topk(probabilities, 3)
        
        # Get the best prediction
        predicted_idx = top_indices[0].item()
        predicted_label = class_labels[predicted_idx]
        confidence = top_probs[0].item() * 100
        
        # Get top 3 predictions with confidence
        top_3_predictions = [(class_labels[idx.item()], prob.item() * 100) for idx, prob in zip(top_indices, top_probs)]
        
        # Check if prediction contains "healthy"
        is_healthy = "healthy" in predicted_label.lower()
        
    return {
        "is_valid_leaf": True,
        "label": predicted_label,
        "confidence": confidence,
        "is_healthy": is_healthy,
        "top_3": top_3_predictions
    }

if __name__ == "__main__":
    image_path = "utils/test_leaf.jpg"  # Update path 
    result = predict(image_path)
    if result["is_valid_leaf"]:
        print(f"Best Model Prediction: {result['label']} (Confidence: {result['confidence']:.2f}%)")
        print(f"Plant is {'healthy' if result['is_healthy'] else 'diseased'}")
        print("Top 3 predictions:")
        for label, conf in result["top_3"]:
            print(f"  {label}: {conf:.2f}%")
    else:
        print(result["error"])