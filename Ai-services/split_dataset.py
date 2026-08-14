import os
import re
import shutil
import random
from collections import defaultdict

# ==============================
# SETTINGS
# ==============================

SOURCE_DIR = "dataset/final_dataset"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

random.seed(SEED)


# ==============================
# GET IMAGE GROUP ID
# ==============================

def get_group_id(filename):
    name = os.path.splitext(filename)[0]

    # ==============================
    # FRAME DATASETS
    # Example:
    # IMG-1189_frame_25 -> IMG-1189
    # ==============================
    match = re.match(r"(.+?)_frame_\d+", name)

    if match:
        return match.group(1)

    # ==============================
    # ACNE DATASET
    # All acne augmentations belong
    # to an original 3-digit ID.
    # ==============================
    if "__" in name:
        before = name.split("__")[0]

        # Take last 3 digits
        match = re.search(r"(\d{3})$", before)

        if match:
            return f"acne_{match.group(1)}"

    # Other images = separate group
    return name


# ==============================
# CREATE SPLIT FOLDERS
# ==============================

for split in ["train", "validation", "test"]:
    split_path = os.path.join(SOURCE_DIR, split)

    if os.path.exists(split_path):
        shutil.rmtree(split_path)

    os.makedirs(split_path)


# ==============================
# FIND CLASSES
# ==============================

classes = []

for item in os.listdir(SOURCE_DIR):
    path = os.path.join(SOURCE_DIR, item)

    if (
        os.path.isdir(path)
        and item not in [
            "train",
            "validation",
            "test",
            "train_old",
            "validation_old",
            "test_old"
        ]
    ):
        classes.append(item)


print("\nClasses found:")

for cls in classes:
    print("-", cls)


# ==============================
# SPLIT EACH CLASS
# ==============================

for cls in classes:

    class_path = os.path.join(SOURCE_DIR, cls)

    files = [
        f for f in os.listdir(class_path)
        if os.path.isfile(os.path.join(class_path, f))
    ]

    # --------------------------
    # CREATE GROUPS
    # --------------------------

    groups = defaultdict(list)

    for file in files:
        group_id = get_group_id(file)

        groups[group_id].append(file)

    group_ids = list(groups.keys())

    random.shuffle(group_ids)

    total_groups = len(group_ids)

    train_end = int(total_groups * TRAIN_RATIO)
    val_end = train_end + int(total_groups * VAL_RATIO)

    train_groups = group_ids[:train_end]
    val_groups = group_ids[train_end:val_end]
    test_groups = group_ids[val_end:]

    splits = {
        "train": train_groups,
        "validation": val_groups,
        "test": test_groups
    }

    # --------------------------
    # COPY FILES
    # --------------------------

    print(f"\n===== {cls} =====")

    print(f"Total images: {len(files)}")
    print(f"Total groups: {total_groups}")

    for split, selected_groups in splits.items():

        destination = os.path.join(
            SOURCE_DIR,
            split,
            cls
        )

        os.makedirs(destination, exist_ok=True)

        image_count = 0

        for group_id in selected_groups:

            for file in groups[group_id]:

                source_file = os.path.join(
                    class_path,
                    file
                )

                destination_file = os.path.join(
                    destination,
                    file
                )

                shutil.copy2(
                    source_file,
                    destination_file
                )

                image_count += 1

        print(
            f"{split.capitalize()}: "
            f"{len(selected_groups)} groups, "
            f"{image_count} images"
        )


print("\n===================================")
print("Leakage-aware dataset split completed.")
print("===================================")