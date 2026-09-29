import os
import shutil

DISEASE_DIR = "dataset/final_dataset"
NORMAL_DIR = "dataset/validation_split"
OUTPUT_DIR = "dataset/normal_disease"

SPLITS = {
    "train": {
        "disease": "train",
        "normal": "train"
    },
    "val": {
        "disease": "validation",
        "normal": "val"
    },
    "test": {
        "disease": "test",
        "normal": "test"
    }
}

DISEASE_CLASSES = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]


def get_images(folder):
    if not os.path.exists(folder):
        print(f"⚠️ Not found: {folder}")
        return []

    return [
        f for f in os.listdir(folder)
        if f.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp")
        )
    ]


def copy_images(source_dir, destination_dir):
    os.makedirs(destination_dir, exist_ok=True)

    images = get_images(source_dir)

    for image in images:
        shutil.copy2(
            os.path.join(source_dir, image),
            os.path.join(destination_dir, image)
        )

    return len(images)


# =========================
# CREATE DATASET
# =========================

results = {}

for split, paths in SPLITS.items():

    print(f"\n========== {split.upper()} ==========")

    results[split] = {
        "normal_skin": 0,
        "disease": 0
    }

    # -------------------------
    # NORMAL SKIN
    # -------------------------

    normal_source = os.path.join(
        NORMAL_DIR,
        paths["normal"],
        "normal_skin"
    )

    normal_destination = os.path.join(
        OUTPUT_DIR,
        split,
        "normal_skin"
    )

    normal_count = copy_images(
        normal_source,
        normal_destination
    )

    results[split]["normal_skin"] = normal_count

    print(f"Normal skin: {normal_count}")

    # -------------------------
    # DISEASE
    # -------------------------

    disease_destination = os.path.join(
        OUTPUT_DIR,
        split,
        "disease"
    )

    disease_count = 0

    for disease in DISEASE_CLASSES:

        disease_source = os.path.join(
            DISEASE_DIR,
            paths["disease"],
            disease
        )

        count = copy_images(
            disease_source,
            disease_destination
        )

        print(f"{disease}: {count}")

        disease_count += count

    results[split]["disease"] = disease_count

    print(f"Total disease: {disease_count}")


# =========================
# SUMMARY
# =========================

print("\n================================")
print("NORMAL vs DISEASE DATASET")
print("================================")

for split in ["train", "val", "test"]:

    normal = results[split]["normal_skin"]
    disease = results[split]["disease"]

    print(f"\n{split.upper()}")
    print(f"Normal skin : {normal}")
    print(f"Disease     : {disease}")
    print(f"Total       : {normal + disease}")

print("\n✅ Dataset creation complete.")