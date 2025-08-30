import numpy as np
from PIL import Image
import tensorflow as tf

# Test the grad_cam_plus function
def test_grad_cam():
    # Load model
    model = tf.keras.models.load_model("Model/model4.h5")
    
    # Create a dummy image
    dummy_image = np.random.rand(224, 224, 3).astype(np.float32)
    img_array = np.expand_dims(dummy_image, axis=0)
    
    # Create gradient model
    grad_model = tf.keras.models.Model(
        model.inputs, 
        [model.get_layer("out_relu").output, model.output]
    )
    
    print("Testing grad_model...")
    outputs = grad_model(img_array)
    print(f"Conv output shape: {outputs[0].shape}")
    print(f"Predictions type: {type(outputs[1])}")
    
    if isinstance(outputs[1], list):
        print(f"Predictions is a list with {len(outputs[1])} elements")
        predictions = tf.convert_to_tensor(outputs[1])
        print(f"Converted predictions shape: {predictions.shape}")
    else:
        predictions = outputs[1]
        print(f"Predictions shape: {predictions.shape}")
    
    # Test the indexing
    if isinstance(outputs[1], list):
        predictions = tf.convert_to_tensor(outputs[1])
    else:
        predictions = outputs[1]
    
    # Reshape predictions if needed
    if len(predictions.shape) == 3 and predictions.shape[1] == 1:
        predictions = tf.squeeze(predictions, axis=1)
        print(f"Reshaped predictions shape: {predictions.shape}")
    
    pred_index = tf.argmax(predictions[0])
    print(f"Predicted index: {pred_index}")
    print(f"Predicted index shape: {pred_index.shape}")
    
    # Test the problematic line
    try:
        class_channel = tf.gather(predictions, pred_index, axis=1)
        print(f"Class channel shape: {class_channel.shape}")
        print("✅ Indexing works correctly!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_grad_cam()
