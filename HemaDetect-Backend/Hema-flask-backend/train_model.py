import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

def create_model():
    model = keras.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 3)),
        layers.MaxPooling2D(2, 2),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(10, activation='softmax')  # 10 classes
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

model = create_model()

# Generate dummy data (replace with real images)
X_train = np.random.rand(100, 64, 64, 3)
y_train = np.random.randint(0, 10, 100)

model.fit(X_train, y_train, epochs=3, batch_size=16)
model.save("model.h5")
print("✅ Model saved as 'model.h5'")
