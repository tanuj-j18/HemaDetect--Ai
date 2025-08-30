# from flask import request, jsonify, Flask
# import tensorflow as tf
# import io
# from PIL import Image
# import numpy as np
# import cv2
# import base64
# IMG_SIZE = (224, 224)
# # classifier_model = load_model('melanoma_nevus_model.h5')
# # segmentation_model = load_model('modelmask.h5')
# model = tf.keras.models.load_model('best_model_mel_nv.h5')

# def preprocess_for_classifier(image):
#     image = image.resize((224, 224))
#     img_array = np.array(image) / 255.0
#     return np.expand_dims(img_array, axis=0)

# def preprocess_for_segmentation(image):
#     image = image.resize((128, 128))
#     img_array = np.array(image) / 255.0
#     return np.expand_dims(img_array, axis=0)

# def postprocess_mask(mask):
#     mask = mask[0, :, :, 0]
#     mask = (mask * 255).astype(np.uint8)
#     _, buffer = cv2.imencode('.png', mask)
#     return base64.b64encode(buffer).decode('utf-8')

# def interpret_prediction(pred):
#     mel_prob, _ = pred
#     if mel_prob > 0.7:
#         return "High probability of melanoma - Consult a dermatologist immediately"
#     elif mel_prob > 0.4:
#         return "Moderate probability of melanoma - Recommended to see a specialist"
#     return "Low probability of melanoma - Likely benign nevus"

# def register_predict_route(app):
#     @app.route('/predict', methods=['POST'])
#     def predict():
#         if model is None:
#             return jsonify({'error': 'Model not loaded'}), 500
#         if 'image' not in request.files:
#             return jsonify({'error': 'Image is required'}), 400
        
#         try :
#             # Get form data (maintaining frontend compatibility)
#             file = request.files['image']
#             sex = request.form.get('sex', 'male')  # Not used in prediction
#             age = request.form.get('age', '40')    # Not used in prediction
#             anatom_site = request.form.get('anatom_site', 'torso')  # Not used
            
#             # Process image
#             img_bytes = file.read()
#             img = Image.open(io.BytesIO(img_bytes))
            
#             # Convert to RGB if needed
#             if img.mode != 'RGB':
#                 img = img.convert('RGB')
            
#             # Resize and preprocess
#             img = img.resize(IMG_SIZE)
#             img_array = tf.keras.preprocessing.image.img_to_array(img)
#             img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
#             img_array = np.expand_dims(img_array, axis=0)
            
#             # Make prediction
#             predictions = model.predict(img_array)[0]
#             mel_prob = float(predictions[0])
#             nv_prob = float(predictions[1])
            
#             # Prepare response matching frontend expectations
#             return jsonify({
#                 'diagnosis': {
#                     'Melanoma': mel_prob,
#                     'Nevus': nv_prob
#                 },
#                 'interpretation': interpret_prediction([mel_prob, nv_prob])
#             })
        
#         except Exception as e:
#             app.logger.error(f"Prediction error: {str(e)}")
#             return jsonify({'error': str(e)}), 500
# #####################################################
#         # image_file = request.files['image']
#         # image = Image.open(image_file).convert('RGB')

#         # classifier_input = preprocess_for_classifier(image)
#         # classifier_output = classifier_model.predict(classifier_input)[0]

#         # segmentation_input = preprocess_for_segmentation(image)
#         # segmentation_output = segmentation_model.predict(segmentation_input)
#         # segmentation_mask = postprocess_mask(segmentation_output)

#         # return jsonify({
#         #     'classification_result': {
#         #         'melanoma': float(classifier_output[0]),
#         #         'nevus': float(classifier_output[1])
#         #     },
#         #     'segmentation_mask': segmentation_mask
#         # })


# from flask import request, jsonify, Flask
# import tensorflow as tf
# import io
# from PIL import Image
# import numpy as np
# import cv2
# import base64

# # Load both models
# classifier_model = tf.keras.models.load_model('best_model_mel_nv.h5')
# segmentation_model = tf.keras.models.load_model('modelmask.h5')

# IMG_SIZE = (224, 224)
# SEG_SIZE = (128, 128)

# def preprocess_for_classifier(img_array):
#     img_array = cv2.resize(img_array, IMG_SIZE)
#     img_array = img_array / 255.0
#     return np.expand_dims(img_array, axis=0)

# def preprocess_for_segmentation(img_array):
#     img_array = cv2.resize(img_array, SEG_SIZE)
#     img_array = img_array / 255.0
#     return np.expand_dims(img_array, axis=0)

# def postprocess_mask(mask):
#     # Extract the mask and convert to a proper image format
#     mask = mask[0, :, :, 0]
#     mask = (mask * 255).astype(np.uint8)
    
#     # Create a colored overlay mask for better visualization
#     colored_mask = cv2.cvtColor(mask, cv2.COLOR_GRAY2RGB)
#     # Make the mask red for better visibility
#     colored_mask[:, :, 0] = 0  # Blue channel
#     colored_mask[:, :, 1] = 0  # Green channel
#     # Red channel is kept as is
    
#     # Convert to base64 for sending to frontend
#     _, buffer = cv2.imencode('.png', colored_mask)
#     return base64.b64encode(buffer).decode('utf-8')

# def interpret_prediction(pred):
#     mel_prob = pred[0]
#     if mel_prob > 0.7:
#         return "High probability of melanoma - Consult a dermatologist immediately"
#     elif mel_prob > 0.4:
#         return "Moderate probability of melanoma - Recommended to see a specialist"
#     return "Low probability of melanoma - Likely benign nevus"

# def register_predict_route(app):
#     @app.route('/predict', methods=['POST'])
#     def predict():
#         if 'image' not in request.files:
#             return jsonify({'error': 'Image is required'}), 400
        
#         try:
#             # Get image file
#             file = request.files['image']
            
#             # Read image
#             img_bytes = file.read()
#             img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
            
#             if img is None:
#                 return jsonify({'error': 'Invalid image format'}), 400
            
#             # Process for classification
#             classifier_input = preprocess_for_classifier(img)
#             classification_result = classifier_model.predict(classifier_input)[0]
#             mel_prob = float(classification_result[0])
#             nv_prob = float(classification_result[1])
            
#             # Process for segmentation
#             segmentation_input = preprocess_for_segmentation(img)
#             segmentation_output = segmentation_model.predict(segmentation_input)
#             segmentation_mask = postprocess_mask(segmentation_output)
            
#             # Prepare response
#             return jsonify({
#                 'diagnosis': {
#                     'Melanoma': mel_prob,
#                     'Nevus': nv_prob
#                 },
#                 'interpretation': interpret_prediction([mel_prob, nv_prob]),
#                 'segmentation_mask': segmentation_mask
#             })
        
#         except Exception as e:
#             app.logger.error(f"Prediction error: {str(e)}")
#             return jsonify({'error': str(e)}), 500

# # If running this file directly
# if __name__ == "__main__":
#     app = Flask(__name__)
#     register_predict_route(app)
#     app.run(host='0.0.0.0', port=5001, debug=True)


from flask import request, jsonify, Flask
import tensorflow as tf
import io
from PIL import Image
import numpy as np
import cv2
import base64

# Load only the classifier model
classifier_model = tf.keras.models.load_model('best_model_mel_nv.h5')

IMG_SIZE = (224, 224)

def preprocess_for_classifier(img_array):
    img_array = cv2.resize(img_array, IMG_SIZE)
    img_array = img_array / 255.0
    return np.expand_dims(img_array, axis=0)

def segment_skin_lesion(image):
    # Resize for consistent processing
    img = cv2.resize(image, (300, 300))
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply adaptive thresholding 
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                  cv2.THRESH_BINARY_INV, 11, 2)
    
    # Another approach: Otsu's thresholding
    _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Combine the two approaches for better results
    combined = cv2.bitwise_or(thresh, otsu)
    
    # Find contours
    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a blank mask
    mask = np.zeros_like(gray)
    
    # If contours are found, find the largest one (likely the lesion)
    if contours:
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Only proceed if the contour is sufficiently large
        if cv2.contourArea(largest_contour) > 100:
            # Fill the contour
            cv2.drawContours(mask, [largest_contour], 0, 255, -1)
            
            # Optional: smoothen the mask
            mask = cv2.GaussianBlur(mask, (9, 9), 0)
            _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    
    # Create color overlay for visualization
    # Convert mask to 3-channel
    color_mask = np.zeros_like(img)
    lesion_area = (mask > 0)
    
    # Create a semi-transparent red overlay
    color_mask[lesion_area] = [0, 0, 255]  # Red in BGR
    
    # Blend with original image for better visualization
    alpha = 0.6  # Transparency factor
    overlay = cv2.addWeighted(img, 1, color_mask, alpha, 0)
    
    # Draw contour on the overlay for better visualization
    if contours and cv2.contourArea(largest_contour) > 100:
        cv2.drawContours(overlay, [largest_contour], 0, (0, 255, 255), 2)  # Yellow contour
    
    return mask, overlay

def create_heatmap_overlay(image, binary_mask):
    """Create a heatmap overlay to highlight the lesion area"""
    # Resize the mask to match the image size if needed
    binary_mask = cv2.resize(binary_mask, (image.shape[1], image.shape[0]))
    
    # Create a heatmap using the jet colormap
    heatmap = cv2.applyColorMap(binary_mask, cv2.COLORMAP_JET)
    
    # Create an alpha-blended overlay
    alpha = 0.4
    overlay = cv2.addWeighted(image, 1, heatmap, alpha, 0)
    
    return overlay

def postprocess_mask(mask, original_image):
    """Convert mask to base64 for sending to frontend"""
    # Get a colored visualization of the mask
    _, overlay = segment_skin_lesion(original_image)
    
    # Encode the overlay as a PNG image
    _, buffer = cv2.imencode('.png', overlay)
    return base64.b64encode(buffer).decode('utf-8')

def interpret_prediction(pred):
    mel_prob = pred[0]
    if mel_prob > 0.7:
        return "High probability of melanoma - Consult a dermatologist immediately"
    elif mel_prob > 0.4:
        return "Moderate probability of melanoma - Recommended to see a specialist"
    return "Low probability of melanoma - Likely benign nevus"

def register_predict_route(app):
    @app.route('/predict', methods=['POST'])
    def predict():
        if 'image' not in request.files:
            return jsonify({'error': 'Image is required'}), 400
        
        try:
            # Get image file
            file = request.files['image']
            
            # Read image
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return jsonify({'error': 'Invalid image format'}), 400
            
            # Process for classification
            classifier_input = preprocess_for_classifier(img)
            classification_result = classifier_model.predict(classifier_input)[0]
            mel_prob = float(classification_result[0])
            nv_prob = float(classification_result[1])
            
            # Process for segmentation using OpenCV
            binary_mask, overlay = segment_skin_lesion(img)
            
            # Create heatmap visualization
            heatmap_overlay = create_heatmap_overlay(img, binary_mask)
            
            # Convert overlay to base64
            _, buffer = cv2.imencode('.png', heatmap_overlay)
            segmentation_mask = base64.b64encode(buffer).decode('utf-8')
            
            # Calculate lesion characteristics based on mask
            lesion_area_percentage = (np.sum(binary_mask > 0) / binary_mask.size) * 100
            
            # Calculate border complexity (perimeter-to-area ratio)
            contours, _ = cv2.findContours(binary_mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                perimeter = cv2.arcLength(largest_contour, True)
                area = cv2.contourArea(largest_contour)
                border_complexity = perimeter**2 / (4 * np.pi * area) if area > 0 else 0
            else:
                border_complexity = 0
            
            # Additional segmentation details to return
            segmentation_details = {
                "lesion_area_percentage": float(lesion_area_percentage),
                "border_complexity": float(border_complexity)
            }
            
            # Prepare response
            return jsonify({
                'diagnosis': {
                    'Melanoma': mel_prob,
                    'Nevus': nv_prob
                },
                'interpretation': interpret_prediction([mel_prob, nv_prob]),
                'segmentation_mask': segmentation_mask,
                'segmentation_details': segmentation_details
            })
        
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            return jsonify({'error': str(e)}), 500

# # If running this file directly
# if __name__ == "__main__":
#     app = Flask(__name__)
#     register_predict_route(app)
#     app.run(host='0.0.0.0', port=5001, debug=True)