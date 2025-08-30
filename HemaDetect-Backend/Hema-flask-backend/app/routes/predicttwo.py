from flask import request, jsonify, Flask
import tensorflow as tf
import io
from PIL import Image
import numpy as np
import cv2
import base64

# Load both models
classifier_model = tf.keras.models.load_model('best_model_mel_nv.h5')
segmentation_model = tf.keras.models.load_model('modelmask.h5')

IMG_SIZE = (224, 224)
SEG_SIZE = (128, 128)

def preprocess_for_classifier(img_array):
    img_array = cv2.resize(img_array, IMG_SIZE)
    img_array = img_array / 255.0
    return np.expand_dims(img_array, axis=0)

def preprocess_for_segmentation(img_array):
    img_array = cv2.resize(img_array, SEG_SIZE)
    img_array = img_array / 255.0
    return np.expand_dims(img_array, axis=0)

def postprocess_mask(mask):
    # Extract the mask and convert to a proper image format
    mask = mask[0, :, :, 0]
    mask = (mask * 255).astype(np.uint8)
    
    # Create a colored overlay mask for better visualization
    colored_mask = cv2.cvtColor(mask, cv2.COLOR_GRAY2RGB)
    # Make the mask red for better visibility
    colored_mask[:, :, 0] = 0  # Blue channel
    colored_mask[:, :, 1] = 0  # Green channel
    # Red channel is kept as is
    
    # Convert to base64 for sending to frontend
    _, buffer = cv2.imencode('.png', colored_mask)
    return base64.b64encode(buffer).decode('utf-8')

def interpret_prediction(pred):
    mel_prob = pred[0]
    if mel_prob > 0.7:
        return "High probability of melanoma - Consult a dermatologist immediately"
    elif mel_prob > 0.4:
        return "Moderate probability of melanoma - Recommended to see a specialist"
    return "Low probability of melanoma - Likely benign nevus"

def register_predicttwo_route(app):
    @app.route('/predicttwo', methods=['POST'])
    def predicttwo():
        if 'image' not in request.files:
            return jsonify({'error': 'Image is required'}), 400
        
        try:
            # Get image file
            file = request.files['image']
            
            # Read image
            img_bytes = file.read()
            img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
            
            if img is None:
                return jsonify({'error': 'Invalid image format'}), 400
            
            # Process for classification
            classifier_input = preprocess_for_classifier(img)
            classification_result = classifier_model.predict(classifier_input)[0]
            mel_prob = float(classification_result[0])
            nv_prob = float(classification_result[1])
            
            # Process for segmentation
            segmentation_input = preprocess_for_segmentation(img)
            segmentation_output = segmentation_model.predict(segmentation_input)
            segmentation_mask = postprocess_mask(segmentation_output)
            
            # Prepare response
            return jsonify({
                'diagnosis': {
                    'Melanoma': mel_prob,
                    'Nevus': nv_prob
                },
                'interpretation': interpret_prediction([mel_prob, nv_prob]),
                'segmentation_mask': segmentation_mask
            })
        
        except Exception as e:
            app.logger.error(f"Prediction error: {str(e)}")
            return jsonify({'error': str(e)}), 500

# If running this file directly
# if __name__ == "__main__":
#     app = Flask(__name__)
#     register_predict_route(app)
#     app.run(host='0.0.0.0', port=5001, debug=True)