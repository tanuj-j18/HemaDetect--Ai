from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import cv2
from PIL import Image
import io
import base64
from sklearn.cluster import KMeans
from scipy import ndimage as ndi
from skimage import morphology

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="Model/model4.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Load H5 model for Grad-CAM++
gradcam_model = tf.keras.models.load_model("Model/model4.h5")

# Class labels
class_names = ['EarlyPreB', 'PreB', 'ProB', 'Benign']

# Preprocess the image
def preprocess_image(image):
    image = image.convert("RGB").resize((224, 224))
    image = np.array(image).astype(np.float32) / 255.0
    return np.expand_dims(image, axis=0)

# Predict using TFLite
def predict_tflite(img_array):
    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    return output_data[0]

# ✅ Grad-CAM++ (your custom function)
def grad_cam_plus(model, img_array, last_conv_layer_name="out_relu"):
    try:
        # Create gradient model
        grad_model = tf.keras.models.Model(
            model.inputs, 
            [model.get_layer(last_conv_layer_name).output, model.output]
        )
        
        with tf.GradientTape() as tape1:
            with tf.GradientTape() as tape2:
                # Get model outputs
                outputs = grad_model(img_array)
                conv_output = outputs[0]
                predictions = outputs[1]
                
                # Handle case where predictions is a list
                if isinstance(predictions, list):
                    predictions = tf.convert_to_tensor(predictions)
                
                # Reshape predictions if needed
                if len(predictions.shape) == 3 and predictions.shape[1] == 1:
                    predictions = tf.squeeze(predictions, axis=1)
                
                # Get the predicted class (ensure it's a scalar)
                pred_index = tf.argmax(predictions[0])
                
                # Get the class score for the predicted class
                class_channel = tf.gather(predictions, pred_index, axis=1)
            
            first_grad = tape2.gradient(class_channel, conv_output)
        second_grad = tape1.gradient(first_grad, conv_output)

        # Handle None gradients
        if first_grad is None or second_grad is None:
            # Return a default heatmap if gradients are None
            return np.zeros((224, 224, 3), dtype=np.uint8)

        alpha_num = tf.square(first_grad)
        alpha_denom = (2 * tf.square(first_grad)) + (second_grad * conv_output)
        alpha_denom = tf.where(alpha_denom != 0.0, alpha_denom, tf.ones_like(alpha_denom))
        alphas = alpha_num / alpha_denom

        weights = tf.reduce_sum(alphas * tf.nn.relu(second_grad), axis=(1, 2))
        cam = tf.reduce_sum(tf.multiply(weights[:, tf.newaxis, tf.newaxis, :], conv_output), axis=-1)
        cam = tf.squeeze(cam)
        cam = np.maximum(cam, 0)
        
        # Handle division by zero
        cam_max = tf.reduce_max(cam)
        if cam_max > 0:
            cam /= cam_max
        
        cam = cv2.resize(cam.numpy(), (224, 224))
        cam = np.uint8(255 * cam)
        cam = cv2.applyColorMap(cam, cv2.COLORMAP_JET)
        return cam
    
    except Exception as e:
        print(f"Error in grad_cam_plus: {e}")
        # Return a default heatmap on error
        return np.zeros((224, 224, 3), dtype=np.uint8)

# Generate overlay image from heatmap
def generate_overlay(original_image, heatmap, alpha=0.4):
    # Convert PIL image to OpenCV BGR for blending
    image = original_image.resize((224, 224)).convert("RGB")
    image_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Resize heatmap and apply blending
    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap) if heatmap.max() <= 1 else heatmap
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(image_bgr, 0.6, heatmap, 0.4, 0)
    overlay_img = Image.fromarray(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))

    # Convert to base64 for return
    buffered = io.BytesIO()
    overlay_img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

# Segment image using KMeans + Morphology
def segment_image(image_pil):
    img = np.array(image_pil.resize((224, 224)).convert("RGB"))
    i_lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    _, a, _ = cv2.split(i_lab)
    flat_a = a.reshape((-1, 1))

    km = KMeans(n_clusters=7, random_state=0, n_init=10).fit(flat_a)
    clustered = km.cluster_centers_[km.labels_]
    clustered_img = clustered.reshape(a.shape).astype(np.uint8)

    _, binary_mask = cv2.threshold(clustered_img, 141, 255, cv2.THRESH_BINARY)
    filled = ndi.binary_fill_holes(binary_mask)
    cleaned1 = morphology.remove_small_objects(filled, 200)
    cleaned2 = morphology.remove_small_holes(cleaned1, 250)
    final_mask = cleaned2.astype(np.uint8)

    segmented = cv2.bitwise_and(img, img, mask=final_mask)
    segmented_img = Image.fromarray(segmented)

    buffered = io.BytesIO()
    segmented_img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    try:
        img = Image.open(file.stream)
    except Exception as e:
        return jsonify({"error": f"Invalid image format: {str(e)}"}), 400

    try:
        img_array = preprocess_image(img)

        # Run prediction
        predictions = predict_tflite(img_array)
        predicted_class_index = int(np.argmax(predictions))
        predicted_class_name = class_names[predicted_class_index]
        confidence = float(np.max(predictions))

        # Grad-CAM++ using your function
        heatmap = grad_cam_plus(gradcam_model, img_array)
        gradcam_b64 = generate_overlay(img, heatmap)

        # Segmentation
        segmented_b64 = segment_image(img)

        return jsonify({
            "predictions": predictions.tolist(),
            "predicted_class": predicted_class_index,
            "predicted_class_name": predicted_class_name,
            "confidence": confidence,
            "gradcam": gradcam_b64,
            "segmented": segmented_b64
        })
    
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
