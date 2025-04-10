import os
import io
from flask import Flask, render_template, request, jsonify
from PIL import Image
from test_best_model import predict_from_image
import google.generativeai as genai
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        # Read and process the image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Get prediction
        prediction_result = predict_from_image(image)
        
        # Save result
        result = {
            'label': prediction_result['label'],
            'confidence': float(prediction_result['confidence']),
            'is_healthy': prediction_result['is_healthy'],
            'top_3': [(label, float(conf)) for label, conf in prediction_result['top_3']]
        }
        
        return jsonify(result)

@app.route('/get_disease_info', methods=['POST'])
def get_disease_info():
    data = request.json
    disease_name = data.get('disease_name')
    
    if not disease_name:
        return jsonify({'error': 'No disease name provided'}), 400
    
    if not GEMINI_API_KEY:
        return jsonify({
            'error': 'Gemini API key not configured',
            'mock_data': True,
            'info': {
                'description': 'This is placeholder data. Configure GEMINI_API_KEY to get real information.',
                'causes': ['Cause 1', 'Cause 2'],
                'remedies': ['Remedy 1', 'Remedy 2'],
                'prevention': ['Prevention 1', 'Prevention 2']
            }
        }), 200
    
    try:
        # Prompt for Gemini API
        prompt = f"""
        Provide detailed information about the plant disease: {disease_name}.
        Format the response as a JSON object with the following structure:
        {{
            "description": "Detailed description of the disease",
            "causes": ["Cause 1", "Cause 2", ...],
            "remedies": ["Remedy 1", "Remedy 2", ...],
            "prevention": ["Prevention method 1", "Prevention method 2", ...]
        }}
        Only return the JSON object, nothing else.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the JSON from the response
        try:
            # Extract JSON from response text
            response_text = response.text
            # Remove any markdown code block indicators
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
                
            disease_info = json.loads(response_text)
            return jsonify({'info': disease_info})
        except json.JSONDecodeError:
            # Fallback structured response if JSON parsing fails
            return jsonify({
                'error': 'Failed to parse Gemini API response',
                'raw_response': response.text,
                'info': {
                    'description': 'Information unavailable in JSON format',
                    'causes': [],
                    'remedies': [],
                    'prevention': []
                }
            }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
