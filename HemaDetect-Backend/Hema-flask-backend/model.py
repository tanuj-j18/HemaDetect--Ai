# ============================ IMPORTS ============================

import os
import cv2
import numpy as np
import pandas as pd

from typing import Tuple

from sklearn.model_selection import train_test_split

from tensorflow.keras.applications import ResNet50
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from google.colab import drive


# =========================== CONFIG =============================

CONFIG = {
    "BASE_DIR": "/content/drive/MyDrive/dataset_minor_project/ISIC_2019",
    "IMG_SIZE": (224, 224),
    "BATCH_SIZE": 64,
    "EPOCHS": 10,
    "RANDOM_STATE": 42,
}

# Derived paths
CSV_PATH = os.path.join(CONFIG["BASE_DIR"], "ISIC_2019_Training_GroundTruth.csv")
IMG_DIR = os.path.join(CONFIG["BASE_DIR"], "ISIC_2019_Training_Input/ISIC_2019_Training_Input")
METADATA_PATH = os.path.join(CONFIG["BASE_DIR"], "ISIC_2019_Training_Metadata.csv")
MODEL_SAVE_PATH = os.path.join(CONFIG["BASE_DIR"], "model_with_metadata.h5")


# ======================= DATA VALIDATION =========================

def verify_paths():
    """Ensure all required files and folders exist."""
    required = [CSV_PATH, IMG_DIR, METADATA_PATH]
    for path in required:
        if not os.path.exists(path):
            raise FileNotFoundError(f"❌ Required path missing: {path}")
    print("✅ All paths verified!")


# ========================== DATASET ==============================

def load_and_merge_data() -> pd.DataFrame:
    """Load labels and metadata, filter classes, and add filepaths."""
    print("📄 Reading CSV files...")
    df = pd.read_csv(CSV_PATH)
    metadata = pd.read_csv(METADATA_PATH)

    print("🔗 Merging labels with metadata...")
    df = pd.merge(df, metadata, on="image", how="inner")

    print("🔍 Filtering for binary classification (melanoma vs nevus)...")
    df = df[(df['MEL'] == 1.0) | (df['NV'] == 1.0)].copy()
    df['label'] = np.where(df['MEL'] == 1.0, 'melanoma', 'nevus')
    df['filepath'] = df['image'].apply(lambda x: os.path.join(IMG_DIR, f"{x}.jpg"))

    df = df[df['filepath'].apply(os.path.exists)]
    if df.empty:
        raise ValueError("❌ No valid image paths after filtering.")
    
    print(f"✅ Final dataset shape: {df.shape}")
    return df


def split_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Split data into stratified training and validation sets."""
    train_df, val_df = train_test_split(
        df,
        test_size=0.2,
        stratify=df['label'],
        random_state=CONFIG["RANDOM_STATE"]
    )
    print(f"✅ Data split: {len(train_df)} training, {len(val_df)} validation")
    return train_df, val_df


# ======================= DATA GENERATORS =========================

def create_generators(train_df: pd.DataFrame, val_df: pd.DataFrame):
    """Create training and validation generators with augmentation."""
    train_datagen = ImageDataGenerator(
        rescale=1. / 255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2]
    )

    val_datagen = ImageDataGenerator(rescale=1. / 255)

    train_gen = train_datagen.flow_from_dataframe(
        train_df, x_col='filepath', y_col='label',
        target_size=CONFIG["IMG_SIZE"],
        batch_size=CONFIG["BATCH_SIZE"],
        class_mode='binary'
    )

    val_gen = val_datagen.flow_from_dataframe(
        val_df, x_col='filepath', y_col='label',
        target_size=CONFIG["IMG_SIZE"],
        batch_size=CONFIG["BATCH_SIZE"],
        class_mode='binary'
    )

    return train_gen, val_gen


# ============================ MODEL ==============================

def build_model(freeze_all: bool = True) -> Model:
    base_model = ResNet50(
        weights='imagenet',
        include_top=False,
        input_shape=(*CONFIG["IMG_SIZE"], 3)
    )

    for layer in base_model.layers:
        layer.trainable = not freeze_all

    x = GlobalAveragePooling2D()(base_model.output)
    x = Dropout(0.5)(x)
    output = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=output)

    model.compile(
        optimizer=SGD(
            learning_rate=0.01 if freeze_all else 1e-5,
            momentum=0.9
        ),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    return model


def train_model(model: Model, train_gen, val_gen):
    """Train model with callbacks."""
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=2, min_lr=1e-6)
    ]

    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=CONFIG["EPOCHS"],
        callbacks=callbacks
    )
    return history


# ======================== INFERENCE ==============================

def predict_single_image(model: Model, path: str) -> str:
    """Predict label for a single image."""
    image = cv2.imread(path)
    if image is None:
        raise ValueError(f"❌ Could not read image: {path}")

    image = cv2.resize(image, CONFIG["IMG_SIZE"])
    image = np.expand_dims(image, axis=0) / 255.0

    pred = model.predict(image)
    return "melanoma" if pred[0][0] > 0.5 else "nevus"


# ========================= PIPELINE ==============================

def main():
    print("🔗 Mounting Google Drive...")
    drive.mount('/content/drive')
    print("✅ Google Drive mounted.\n")

    print("🔍 Verifying dataset paths...")
    verify_paths()

    print("\n📊 Loading and preparing data...")
    df = load_and_merge_data()

    print("\n📂 Splitting dataset...")
    train_df, val_df = split_data(df)

    print("\n🧪 Preparing image generators...")
    train_gen, val_gen = create_generators(train_df, val_df)

    print("\n🔧 Building and training base model...")
    model = build_model(freeze_all=True)
    train_model(model, train_gen, val_gen)

    print("\n🔁 Fine-tuning model...")
    model = build_model(freeze_all=False)
    train_model(model, train_gen, val_gen)

    print("\n💾 Saving model...")
    model.save(MODEL_SAVE_PATH)
    print(f"✅ Model saved at: {MODEL_SAVE_PATH}")

    print("\n🔍 Running prediction on a sample image...")
    sample_path = val_df.iloc[0]['filepath']
    result = predict_single_image(model, sample_path)
    print(f"✅ Prediction: {result}")


# ========================= EXECUTION =============================

if __name__ == "__main__":
    main()
