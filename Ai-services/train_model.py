import tensorflow as tf
import numpy as np
from pathlib import Path

# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = Path("dataset/final_dataset")

TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"
TEST_DIR = DATASET_DIR / "test"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

# Phase 1: classifier training
PHASE1_EPOCHS = 15

# Phase 2: fine tuning
PHASE2_EPOCHS = 15

SEED = 42

BEST_MODEL_PATH = "best_model.keras"


# ============================================================
# GPU / CPU CONFIGURATION
# ============================================================

print("\n==============================================")
print("        DERMADETECT AI MODEL TRAINING")
print("==============================================")

gpus = tf.config.list_physical_devices("GPU")

if gpus:
    print("\nGPU detected:")
    for gpu in gpus:
        print(gpu)
else:
    print("\nNo GPU detected.")
    print("Training will use CPU.")


# ============================================================
# LOAD DATASETS
# ============================================================

print("\nLoading datasets...")


train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=SEED,
    label_mode="int"
)


val_dataset = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
    label_mode="int"
)


test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False,
    label_mode="int"
)


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = train_dataset.class_names

NUM_CLASSES = len(CLASS_NAMES)

print("\n==============================================")
print("CLASSES")
print("==============================================")

for index, class_name in enumerate(CLASS_NAMES):
    print(f"{index}: {class_name}")

print("\nNumber of classes:", NUM_CLASSES)


# ============================================================
# CHECK CLASS CONSISTENCY
# ============================================================

if val_dataset.class_names != CLASS_NAMES:
    raise ValueError(
        "Validation classes do not match training classes."
    )

if test_dataset.class_names != CLASS_NAMES:
    raise ValueError(
        "Test classes do not match training classes."
    )

print("\nClass consistency check: PASSED")


# ============================================================
# DATASET PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    buffer_size=AUTOTUNE
)

val_dataset = val_dataset.prefetch(
    buffer_size=AUTOTUNE
)

test_dataset = test_dataset.prefetch(
    buffer_size=AUTOTUNE
)


# ============================================================
# CALCULATE CLASS WEIGHTS
# ============================================================
#
# Tumhare dataset mein classes balanced nahi hain.
#
# Class weights minority classes ko extra importance dete hain.
#
# Isse Ringworm jaise comparatively smaller class ko
# model ignore karne ke chances kam hote hain.
#
# ============================================================

print("\n==============================================")
print("CALCULATING CLASS WEIGHTS")
print("==============================================")


class_counts = {}

for class_index, class_name in enumerate(CLASS_NAMES):

    class_folder = TRAIN_DIR / class_name

    image_count = 0

    for file in class_folder.iterdir():

        if file.is_file():
            image_count += 1

    class_counts[class_index] = image_count


total_train_images = sum(class_counts.values())


class_weights = {}

for class_index, count in class_counts.items():

    weight = total_train_images / (
        NUM_CLASSES * count
    )

    class_weights[class_index] = weight


for class_index, class_name in enumerate(CLASS_NAMES):

    print(
        f"{class_name:<15}"
        f"Images: {class_counts[class_index]:<6}"
        f"Weight: {class_weights[class_index]:.3f}"
    )


# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential(
    [

        tf.keras.layers.RandomFlip(
            "horizontal"
        ),

        tf.keras.layers.RandomRotation(
            0.05
        ),

        tf.keras.layers.RandomZoom(
            height_factor=(-0.08, 0.08),
            width_factor=(-0.08, 0.08)
        ),

        tf.keras.layers.RandomContrast(
            0.10
        ),

    ],
    name="data_augmentation"
)


# ============================================================
# LOAD MOBILENETV2
# ============================================================

print("\n==============================================")
print("LOADING MOBILENETV2")
print("==============================================")


base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)


# ============================================================
# PHASE 1
# FREEZE BASE MODEL
# ============================================================

base_model.trainable = False


# ============================================================
# BUILD MODEL
# ============================================================

inputs = tf.keras.Input(
    shape=(224, 224, 3),
    name="image"
)


x = data_augmentation(inputs)


x = tf.keras.applications.mobilenet_v2.preprocess_input(
    x
)


x = base_model(
    x,
    training=False
)


x = tf.keras.layers.GlobalAveragePooling2D()(
    x
)


x = tf.keras.layers.Dropout(
    0.35
)(
    x
)


x = tf.keras.layers.Dense(
    128,
    activation="relu"
)(
    x
)


x = tf.keras.layers.Dropout(
    0.25
)(
    x
)


outputs = tf.keras.layers.Dense(
    NUM_CLASSES,
    activation="softmax",
    name="prediction"
)(
    x
)


model = tf.keras.Model(
    inputs,
    outputs
)


# ============================================================
# PHASE 1 COMPILE
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),

    loss=tf.keras.losses.SparseCategoricalCrossentropy(),

    metrics=[
        "accuracy"
    ]

)


# ============================================================
# MODEL SUMMARY
# ============================================================

print("\n==============================================")
print("MODEL SUMMARY")
print("==============================================")

model.summary()


# ============================================================
# CALLBACKS - PHASE 1
# ============================================================

phase1_callbacks = [

    tf.keras.callbacks.ModelCheckpoint(

        BEST_MODEL_PATH,

        monitor="val_accuracy",

        save_best_only=True,

        save_weights_only=False,

        mode="max",

        verbose=1
    ),

    tf.keras.callbacks.EarlyStopping(

        monitor="val_loss",

        patience=4,

        restore_best_weights=True,

        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(

        monitor="val_loss",

        factor=0.3,

        patience=2,

        min_lr=1e-6,

        verbose=1
    )

]


# ============================================================
# PHASE 1 TRAINING
# ============================================================

print("\n==============================================")
print("PHASE 1 TRAINING")
print("Base model frozen")
print("==============================================")


history_phase1 = model.fit(

    train_dataset,

    validation_data=val_dataset,

    epochs=PHASE1_EPOCHS,

    class_weight=class_weights,

    callbacks=phase1_callbacks,

    verbose=1

)


# ============================================================
# LOAD BEST PHASE 1 MODEL
# ============================================================

print("\nLoading best Phase 1 model...")

model = tf.keras.models.load_model(
    BEST_MODEL_PATH
)


# ============================================================
# PHASE 2
# FINE TUNING
# ============================================================

print("\n==============================================")
print("PHASE 2 - FINE TUNING")
print("==============================================")


# Get MobileNetV2 from model
base_model = model.get_layer(
    "mobilenetv2_1.00_224"
)


base_model.trainable = True


# ------------------------------------------------------------
# Freeze early layers
# ------------------------------------------------------------
#
# Early layers learn generic features.
# We only fine-tune later layers.
#
# ------------------------------------------------------------

fine_tune_from = 100


for layer in base_model.layers[:fine_tune_from]:

    layer.trainable = False


for layer in base_model.layers[fine_tune_from:]:

    layer.trainable = True


# ============================================================
# RECOMPILE WITH VERY LOW LEARNING RATE
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),

    loss=tf.keras.losses.SparseCategoricalCrossentropy(),

    metrics=[
        "accuracy"
    ]

)


print(
    f"\nFine-tuning from layer {fine_tune_from}"
)

print(
    "Trainable base layers:",
    sum(
        layer.trainable
        for layer in base_model.layers
    )
)


# ============================================================
# PHASE 2 CALLBACKS
# ============================================================

phase2_callbacks = [

    tf.keras.callbacks.ModelCheckpoint(

        BEST_MODEL_PATH,

        monitor="val_accuracy",

        save_best_only=True,

        save_weights_only=False,

        mode="max",

        verbose=1
    ),

    tf.keras.callbacks.EarlyStopping(

        monitor="val_loss",

        patience=5,

        restore_best_weights=True,

        verbose=1
    ),

    tf.keras.callbacks.ReduceLROnPlateau(

        monitor="val_loss",

        factor=0.3,

        patience=2,

        min_lr=1e-7,

        verbose=1
    )

]


# ============================================================
# PHASE 2 TRAINING
# ============================================================

history_phase2 = model.fit(

    train_dataset,

    validation_data=val_dataset,

    epochs=PHASE2_EPOCHS,

    class_weight=class_weights,

    callbacks=phase2_callbacks,

    verbose=1

)


# ============================================================
# LOAD FINAL BEST MODEL
# ============================================================

print("\n==============================================")
print("LOADING FINAL BEST MODEL")
print("==============================================")


model = tf.keras.models.load_model(
    BEST_MODEL_PATH
)


# ============================================================
# FINAL TEST EVALUATION
# ============================================================

print("\n==============================================")
print("FINAL TEST EVALUATION")
print("==============================================")


test_loss, test_accuracy = model.evaluate(
    test_dataset,
    verbose=1
)


print("\n==============================================")
print("FINAL RESULTS")
print("==============================================")

print(
    f"Test Accuracy : {test_accuracy * 100:.2f}%"
)

print(
    f"Test Loss     : {test_loss:.4f}"
)


# ============================================================
# SAVE FINAL MODEL
# ============================================================

model.save(
    "dermadetect_model.keras"
)


# ============================================================
# SAVE CLASS NAMES
# ============================================================

import json

with open(
    "class_names.json",
    "w"
) as file:

    json.dump(
        CLASS_NAMES,
        file,
        indent=4
    )


# ============================================================
# TRAINING COMPLETE
# ============================================================

print("\n==============================================")
print("       TRAINING COMPLETED")
print("==============================================")

print(
    "\nBest model:"
)

print(
    f"  {BEST_MODEL_PATH}"
)

print(
    "\nFinal model:"
)

print(
    "  dermadetect_model.keras"
)

print(
    "\nClasses:"
)

for class_name in CLASS_NAMES:

    print(
        f"  - {class_name}"
    )

print(
    "\n=============================================="
)