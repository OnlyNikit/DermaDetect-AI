import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

# =========================
# CONFIG
# =========================

DATASET_DIR = "dataset/validation_split"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
SEED = 42

# =========================
# LOAD DATA
# =========================

train_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "train"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "val"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(DATASET_DIR, "test"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_ds.class_names

print("\nClasses:", class_names)

# =========================
# CLASS WEIGHTS
# =========================

class_counts = []

for class_name in class_names:
    class_dir = os.path.join(
        DATASET_DIR,
        "train",
        class_name
    )

    count = len([
        f for f in os.listdir(class_dir)
        if f.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp")
        )
    ])

    class_counts.append(count)

print("\nClass counts:")

for name, count in zip(class_names, class_counts):
    print(f"{name}: {count}")

class_weights_array = compute_class_weight(
    class_weight="balanced",
    classes=np.arange(len(class_names)),
    y=np.concatenate([
        np.full(count, i)
        for i, count in enumerate(class_counts)
    ])
)

class_weights = {
    i: float(weight)
    for i, weight in enumerate(class_weights_array)
}

print("\nClass weights:")

for i, weight in class_weights.items():
    print(f"{class_names[i]}: {weight:.3f}")

# =========================
# PERFORMANCE
# =========================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)

# =========================
# DATA AUGMENTATION
# =========================

data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.05),
    layers.RandomZoom(0.10),
])

# =========================
# MODEL
# =========================

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

base_model.trainable = False

inputs = layers.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

x = base_model(x, training=False)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.30)(x)

x = layers.Dense(128, activation="relu")(x)

x = layers.Dropout(0.30)(x)

outputs = layers.Dense(
    2,
    activation="softmax"
)(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-3
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =========================
# CALLBACKS
# =========================

callbacks = [

    EarlyStopping(
        monitor="val_loss",
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
        verbose=1
    ),

    ModelCheckpoint(
        "skin_validator_best.keras",
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    )
]

# =========================
# PHASE 1 TRAINING
# =========================

print("\n================================")
print("PHASE 1: TRAINING CLASSIFIER")
print("================================\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,
    class_weight=class_weights,
    callbacks=callbacks
)

# =========================
# PHASE 2: FINE TUNING
# =========================

print("\n================================")
print("PHASE 2: FINE TUNING")
print("================================\n")

base_model.trainable = True

# Freeze early layers
for layer in base_model.layers[:100]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

history_fine = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,
    class_weight=class_weights,
    callbacks=callbacks
)

# =========================
# LOAD BEST MODEL
# =========================

print("\nLoading best model...")

model = tf.keras.models.load_model(
    "skin_validator_best.keras"
)

# =========================
# TEST
# =========================

print("\n================================")
print("FINAL TEST")
print("================================\n")

test_loss, test_accuracy = model.evaluate(
    test_ds,
    verbose=1
)

print(f"\nTest Loss: {test_loss:.4f}")
print(f"Test Accuracy: {test_accuracy * 100:.2f}%")

# =========================
# SAVE FINAL MODEL
# =========================

model.save("skin_validator.keras")

print("\n✅ Model saved:")
print("skin_validator.keras")

# =========================
# SAVE LABELS
# =========================

with open("skin_validator_labels.json", "w") as f:
    json.dump(class_names, f, indent=4)

print("skin_validator_labels.json saved.")

print("\n================================")
print("TRAINING COMPLETE")
print("================================")