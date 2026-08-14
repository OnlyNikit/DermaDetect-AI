import tensorflow as tf
from pathlib import Path

# ==============================
# CONFIGURATION
# ==============================

DATASET_DIR = Path("dataset/final_dataset")

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 15

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"


# ==============================
# LOAD DATASET
# ==============================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)

val_dataset = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

CLASS_NAMES = train_dataset.class_names

print("\nClasses:", CLASS_NAMES)
print("Number of classes:", len(CLASS_NAMES))


# ==============================
# PERFORMANCE OPTIMIZATION
# ==============================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    buffer_size=AUTOTUNE
)

val_dataset = val_dataset.prefetch(
    buffer_size=AUTOTUNE
)


# ==============================
# DATA AUGMENTATION
# ==============================

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.05),
    tf.keras.layers.RandomZoom(0.1),
])


# ==============================
# PRETRAINED MODEL
# ==============================

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers
base_model.trainable = False


# ==============================
# BUILD MODEL
# ==============================

inputs = tf.keras.Input(
    shape=(224, 224, 3)
)

x = data_augmentation(inputs)

x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

x = base_model(
    x,
    training=False
)

x = tf.keras.layers.GlobalAveragePooling2D()(x)

x = tf.keras.layers.Dropout(0.3)(x)

outputs = tf.keras.layers.Dense(
    len(CLASS_NAMES),
    activation="softmax"
)(x)

model = tf.keras.Model(
    inputs,
    outputs
)


# ==============================
# COMPILE MODEL
# ==============================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=["accuracy"]
)


# ==============================
# MODEL INFO
# ==============================

print("\n========== MODEL SUMMARY ==========\n")

model.summary()

# ==============================
# CALLBACKS
# ==============================

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True
    ),

    tf.keras.callbacks.ModelCheckpoint(
        "best_model.keras",
        monitor="val_accuracy",
        save_best_only=True,
        mode="max"
    )
]


# ==============================
# TRAIN MODEL
# ==============================

history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS,
    callbacks=callbacks
)


# ==============================
# SAVE FINAL MODEL
# ==============================

model.save("dermadetect_model.keras")

print("\nTraining completed.")
print("Best model saved as: best_model.keras")