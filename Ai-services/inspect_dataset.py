import os
from pathlib import Path
from PIL import Image
from collections import Counter

# ============================================================
# CONFIG
# ============================================================

DATASET_DIR = Path("dataset/final_dataset")

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

EXPECTED_CLASSES = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]


# ============================================================
# CHECK DATASET DIRECTORY
# ============================================================

if not DATASET_DIR.exists():
    print("\n❌ Dataset folder not found:")
    print(DATASET_DIR)
    raise SystemExit(1)


print("\n==============================================")
print("       DERMADETECT DATASET AUDIT")
print("==============================================")

print("\nDataset path:")
print(DATASET_DIR.resolve())


# ============================================================
# FIND CLASSES
# ============================================================

actual_classes = sorted([
    folder.name
    for folder in DATASET_DIR.iterdir()
    if folder.is_dir()
    and folder.name not in {
        "train",
        "validation",
        "test",
        "train_old",
        "validation_old",
        "test_old"
    }
])


print("\nDetected classes:")

for cls in actual_classes:
    print(f"  - {cls}")


# ============================================================
# CHECK EXPECTED CLASSES
# ============================================================

print("\n==============================================")
print("CLASS CHECK")
print("==============================================")

missing_classes = [
    cls
    for cls in EXPECTED_CLASSES
    if cls not in actual_classes
]

extra_classes = [
    cls
    for cls in actual_classes
    if cls not in EXPECTED_CLASSES
]


if missing_classes:
    print("\n❌ Missing classes:")
    for cls in missing_classes:
        print(f"  - {cls}")
else:
    print("\n✅ All expected disease classes exist.")


if extra_classes:
    print("\n⚠️ Extra folders:")
    for cls in extra_classes:
        print(f"  - {cls}")


# ============================================================
# IMAGE COUNT + CORRUPTED IMAGE CHECK
# ============================================================

total_images = 0
total_valid_images = 0
total_invalid_images = 0

class_counts = Counter()

invalid_images = []


print("\n==============================================")
print("IMAGE AUDIT")
print("==============================================")


for class_name in actual_classes:

    class_dir = DATASET_DIR / class_name

    files = [
        file
        for file in class_dir.iterdir()
        if file.is_file()
    ]

    class_total = 0
    class_valid = 0
    class_invalid = 0

    for file in files:

        if file.suffix.lower() not in VALID_EXTENSIONS:
            continue

        class_total += 1
        total_images += 1

        try:

            with Image.open(file) as image:

                image.verify()

            # Open again because verify() closes image data
            with Image.open(file) as image:

                image.convert("RGB")

            class_valid += 1
            total_valid_images += 1

        except Exception as error:

            class_invalid += 1
            total_invalid_images += 1

            invalid_images.append({
                "class": class_name,
                "file": str(file),
                "error": str(error)
            })

    class_counts[class_name] = class_valid

    print(
        f"\n{class_name}:"
        f"\n  Total images : {class_total}"
        f"\n  Valid        : {class_valid}"
        f"\n  Invalid      : {class_invalid}"
    )


# ============================================================
# SUMMARY
# ============================================================

print("\n==============================================")
print("SUMMARY")
print("==============================================")

print(f"\nTotal images       : {total_images}")
print(f"Valid images       : {total_valid_images}")
print(f"Invalid images     : {total_invalid_images}")


print("\nClass distribution:")

for class_name in EXPECTED_CLASSES:

    count = class_counts.get(class_name, 0)

    print(
        f"  {class_name:<12} : {count}"
    )


# ============================================================
# IMBALANCE CHECK
# ============================================================

existing_counts = [
    count
    for count in class_counts.values()
    if count > 0
]

if existing_counts:

    maximum = max(existing_counts)
    minimum = min(existing_counts)

    ratio = maximum / minimum

    print("\n==============================================")
    print("CLASS BALANCE")
    print("==============================================")

    print(f"\nLargest class : {maximum}")
    print(f"Smallest class: {minimum}")
    print(f"Ratio         : {ratio:.2f}:1")

    if ratio > 3:
        print(
            "\n⚠️ Dataset is significantly imbalanced."
        )
    else:
        print(
            "\n✅ Class imbalance is within a manageable range."
        )


# ============================================================
# INVALID FILES
# ============================================================

if invalid_images:

    print("\n==============================================")
    print("INVALID IMAGES")
    print("==============================================")

    for item in invalid_images:

        print("\nClass :", item["class"])
        print("File  :", item["file"])
        print("Error :", item["error"])


# ============================================================
# FINAL
# ============================================================

print("\n==============================================")

if total_invalid_images == 0:
    print("✅ Dataset audit completed successfully.")
else:
    print(
        f"⚠️ Dataset contains "
        f"{total_invalid_images} invalid image(s)."
    )

print("==============================================\n")