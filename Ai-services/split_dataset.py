import os
import re
import shutil
import random
from collections import defaultdict

# ============================================================
# SETTINGS
# ============================================================

SOURCE_DIR = "dataset/final_dataset"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

random.seed(SEED)

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


# ============================================================
# GET GROUP ID
# ============================================================

def get_group_id(filename):

    name = os.path.splitext(filename)[0]

    # Example:
    # IMG-1189_frame_25
    # IMG-1189_frame_26
    #
    # Both belong to same original image.

    match = re.match(
        r"(.+?)_frame_\d+",
        name,
        re.IGNORECASE
    )

    if match:
        return match.group(1)


    # Handle augmentation naming
    #
    # Example:
    # image123__aug1
    # image123__aug2

    if "__" in name:

        original = name.split("__")[0]

        return original


    # Otherwise image itself becomes group

    return name


# ============================================================
# GET IMAGE FILES
# ============================================================

def get_images(class_path):

    files = []

    for filename in os.listdir(class_path):

        path = os.path.join(
            class_path,
            filename
        )

        if not os.path.isfile(path):
            continue

        extension = os.path.splitext(
            filename
        )[1].lower()

        if extension in IMAGE_EXTENSIONS:

            files.append(filename)

    return files


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

splits = [
    "train",
    "validation",
    "test"
]

classes = [
    "Acne",
    "Psoriasis",
    "Ringworm",
    "Vitiligo"
]


for split in splits:

    split_path = os.path.join(
        SOURCE_DIR,
        split
    )

    if os.path.exists(split_path):

        print(
            f"Removing old {split} folder..."
        )

        shutil.rmtree(split_path)

    os.makedirs(
        split_path,
        exist_ok=True
    )


# ============================================================
# PROCESS EACH CLASS
# ============================================================

for class_name in classes:

    print("\n================================")
    print(f"CLASS: {class_name}")
    print("================================")

    class_path = os.path.join(
        SOURCE_DIR,
        class_name
    )

    if not os.path.exists(class_path):

        raise FileNotFoundError(
            f"Class folder not found: {class_path}"
        )


    files = get_images(
        class_path
    )

    print(
        f"Total images: {len(files)}"
    )


    # ========================================================
    # GROUP IMAGES
    # ========================================================

    groups = defaultdict(list)

    for filename in files:

        group_id = get_group_id(
            filename
        )

        groups[group_id].append(
            filename
        )


    group_ids = list(
        groups.keys()
    )

    print(
        f"Unique groups: {len(group_ids)}"
    )


    # ========================================================
    # SHUFFLE GROUPS
    # ========================================================

    random.shuffle(
        group_ids
    )


    # ========================================================
    # CALCULATE SPLIT
    # ========================================================

    total_groups = len(
        group_ids
    )

    train_end = int(
        total_groups * TRAIN_RATIO
    )

    val_end = (
        train_end
        + int(total_groups * VAL_RATIO)
    )


    train_groups = group_ids[
        :train_end
    ]

    validation_groups = group_ids[
        train_end:val_end
    ]

    test_groups = group_ids[
        val_end:
    ]


    split_groups = {

        "train": train_groups,

        "validation": validation_groups,

        "test": test_groups
    }


    # ========================================================
    # COPY IMAGES
    # ========================================================

    for split, selected_groups in split_groups.items():

        destination = os.path.join(
            SOURCE_DIR,
            split,
            class_name
        )

        os.makedirs(
            destination,
            exist_ok=True
        )

        image_count = 0

        for group_id in selected_groups:

            for filename in groups[group_id]:

                source = os.path.join(
                    class_path,
                    filename
                )

                destination_file = os.path.join(
                    destination,
                    filename
                )

                shutil.copy2(
                    source,
                    destination_file
                )

                image_count += 1


        print(
            f"{split.capitalize():12} "
            f"groups={len(selected_groups):4} "
            f"images={image_count:5}"
        )


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n")
print("==============================================")
print("       LEAKAGE-SAFE DATASET SPLIT DONE")
print("==============================================")

for split in splits:

    print(f"\n{split.upper()}")

    total = 0

    for class_name in classes:

        folder = os.path.join(
            SOURCE_DIR,
            split,
            class_name
        )

        count = len([
            f
            for f in os.listdir(folder)
            if os.path.isfile(
                os.path.join(folder, f)
            )
        ])

        total += count

        print(
            f"{class_name:12}: {count}"
        )

    print(
        f"TOTAL        : {total}"
    )


print("\n==============================================")
print("Split completed successfully.")
print("==============================================")