import tensorflow as tf

# Load your model to check layer names
model = tf.keras.models.load_model("Model/model4.h5")

print("Model summary:")
model.summary()

print("\nAll layer names:")
for i, layer in enumerate(model.layers):
    print(f"{i}: {layer.name} - {type(layer).__name__}")

# Check if 'out_relu' layer exists
try:
    layer = model.get_layer('out_relu')
    print(f"\nFound 'out_relu' layer: {layer}")
    print(f"Output shape: {layer.output_shape}")
except:
    print("\n'out_relu' layer not found. Looking for last convolutional layer...")
    
    # Find the last convolutional layer
    conv_layers = []
    for layer in model.layers:
        if 'conv' in layer.name.lower() or isinstance(layer, tf.keras.layers.Conv2D):
            conv_layers.append(layer.name)
    
    if conv_layers:
        print(f"Last conv layer found: {conv_layers[-1]}")
    else:
        print("No convolutional layers found")
