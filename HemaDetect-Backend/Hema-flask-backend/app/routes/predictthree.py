from flask import request, jsonify, Flask
import tensorflow as tf
import io
from PIL import Image
import numpy as np
import cv2
import base64
IMG_SIZE = (224, 224)
# classifier_model = load_model('melanoma_nevus_model.h5')
# segmentation_model = load_model('modelmask.h5')
model = tf.keras.models.load_model('best_model_mel_nv.h5')

def preprocess_for_classifier(image):
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

def preprocess_for_segmentation(image):
    image = image.resize((128, 128))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

def postprocess_mask(mask):
    mask = mask[0, :, :, 0]
    mask = (mask * 255).astype(np.uint8)
    _, buffer = cv2.imencode('.png', mask)
    return base64.b64encode(buffer).decode('utf-8')

def interpret_prediction(pred):
    mel_prob, _ = pred
    if mel_prob > 0.7:
        return "High probability of melanoma - Consult a dermatologist immediately"
    elif mel_prob > 0.4:
        return "Moderate probability of melanoma - Recommended to see a specialist"
    return "Low probability of melanoma - Likely benign nevus"

def register_predictthree_route(app):
    @app.route('/predictthree', methods=['POST'])
    def predictthree():
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        if 'image' not in request.files:
            return jsonify({'error': 'Image is required'}), 400
        
        try :
            # Get form data (maintaining frontend compatibility)
            file = request.files['image']
            sex = request.form.get('sex', 'male')  # Not used in prediction
            age = request.form.get('age', '40')    # Not used in prediction
            anatom_site = request.form.get('anatom_site', 'torso')  # Not used
            
            # Process image
            img_bytes = file.read()
            img = Image.open(io.BytesIO(img_bytes))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize and preprocess
            img = img.resize(IMG_SIZE)
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
            img_array = np.expand_dims(img_array, axis=0)
            
            # Make prediction
            predictions = model.predict(img_array)[0]
            mel_prob = float(predictions[0])
            nv_prob = float(predictions[1])
            
            # Prepare response matching frontend expectations
            return jsonify({
                'diagnosis': {
                    'Melanoma': mel_prob,
                    'Nevus': nv_prob
                },
                'interpretation': interpret_prediction([mel_prob, nv_prob])
            })
        
        except Exception as e:
            app.logger.error(f"Prediction error: {str(e)}")
            return jsonify({'error': str(e)}), 500