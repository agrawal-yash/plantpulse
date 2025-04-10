# PlantPulse: AI Plant Disease Detection System

An AI-powered application that detects diseases in plant leaves through image analysis and provides detailed treatment recommendations.

## 🌿 Overview

PlantPulse is an AI-powered web application that helps gardeners, farmers, and plant enthusiasts identify diseases in their plants through image analysis. Simply upload a clear image of a plant leaf, and our system will analyze it to detect potential diseases, providing detailed information and treatment recommendations.

## ✨ Features

- **Disease Detection**: Upload plant leaf images for instant AI analysis
- **Health Assessment**: Determine if your plant is healthy or diseased with confidence ratings
- **Disease Information**: Get detailed information about detected diseases:
  - Comprehensive descriptions
  - Probable causes
  - Recommended remedies
  - Prevention strategies
- **Report Generation**: Download detailed analysis reports as HTML files
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between viewing modes for comfort
- **Multiple Interfaces**: Available as both a Flask web application and Streamlit app

## 🔍 Supported Plants & Diseases

The system can detect 38 different combinations of plants and disease conditions including:

- Apple (Scab, Black Rot, Cedar Rust, Healthy)
- Blueberry (Healthy)
- Cherry (Powdery Mildew, Healthy)
- Corn (Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy)
- Grape (Black Rot, Esca/Black Measles, Leaf Blight/Isariopsis Leaf Spot, Healthy)
- Orange (Haunglongbing/Citrus Greening)
- Peach (Bacterial Spot, Healthy)
- Pepper Bell (Bacterial Spot, Healthy)
- Potato (Early Blight, Late Blight, Healthy)
- Raspberry (Healthy)
- Soybean (Healthy)
- Squash (Powdery Mildew)
- Strawberry (Leaf Scorch, Healthy)
- Tomato (Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Mosaic Virus, Yellow Leaf Curl Virus, Healthy)

## 🧠 AI Model Architecture & Algorithms

Our plant disease detection system employs a comprehensive pipeline of image processing and deep learning techniques:

### Image Preprocessing
- **Gabor Filters**: Extract texture features by analyzing different orientations and frequencies in leaf images, highlighting disease-specific patterns
- **Color Space Transformations**: Converts RGB to HSV color spaces to isolate disease characteristics
- **Image Normalization**: Standardizes pixel values to ensure consistent model inputs

### Feature Extraction & Classification
- **Vision Transformer (ViT)**: State-of-the-art architecture that treats images as sequences of patches for superior pattern recognition
- **Transfer Learning**: Leverages pre-trained models fine-tuned on our plant disease dataset
- **Attention Mechanisms**: Focuses the model on disease-relevant areas of the leaf

### Model Training & Optimization
- **Model Checkpointing**: Saves optimal model states

## 🛠 Technologies Used

- **Backend**: Python, Flask
- **AI/ML**: PyTorch, TorchVision, Transformers (Hugging Face)
- **Image Processing**: OpenCV, scikit-image
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: Google Gemini AI API for detailed disease information


## 📦 Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/agrawal-yash/plant-disease.git
   cd plant-disease
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a .env file in the project root with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🚀 Usage

### Running the Flask Application

1. Start the Flask server:
   ```bash
   python flask_app.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```



### Using the Application

1. Navigate to the "Disease Analyzer" section
2. Click "Choose File" or drag and drop an image of a plant leaf
3. Click "Upload & Analyze"
4. View the results, including:
   - Disease detection status
   - Confidence level
   - Detailed disease information (if a disease is detected)
   - Treatment recommendations
5. Download a comprehensive report for your records

## 🌟 Key Features in Detail

### User Interface
- **Intuitive Navigation**: Easy-to-use sidebar with access to Home, Analyzer, Results, Guide, and About Us sections
- **Interactive Elements**: Tabs, accordions, and cards for organized information display
- **Responsive Design**: Adapts to desktop, tablet, and mobile devices
- **Accessibility Features**: Focus indicators and semantic HTML

### Analysis & Results
- **Real-time Processing**: Quick analysis of uploaded images
- **Confidence Metrics**: Visual indicators showing prediction confidence
- **Tabbed Information**: Organized sections for disease description, causes, remedies, and prevention
- **Detailed Reports**: Generate and download comprehensive HTML reports

### User Experience
- **Theme Toggle**: Switch between light and dark modes
- **Notifications**: Non-intrusive alerts about system status
- **Debug Mode**: Optional technical information for troubleshooting



## 👥 Team

This project was developed by:
- Yash Agrawal ([LinkedIn](https://www.linkedin.com/in/yash-agrawal04/))
- Navya Agrawal ([LinkedIn](https://www.linkedin.com/in/navya-agrawal-43192725a/))
- Shashank Arya ([LinkedIn](https://www.linkedin.com/in/shashank-arya-260a80307/))
- Gopika Barot ([LinkedIn](https://www.linkedin.com))


## 🔮 Future Improvements

- Mobile application development
- Support for more plant species
- Real-time video analysis
- Community features for plant enthusiasts
- Integration with smart garden systems
- Implementation of more specialized filters for different disease families
- Integration with IoT sensors for environmental context

---

© 2025 PlantPulse
