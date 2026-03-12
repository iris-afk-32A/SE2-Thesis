import numpy as np

# Exit zones configuration
EXIT_ZONES = [
    (0, 300, 100, 480),   # door 1
    (540, 300, 640, 480)  # door 2
]


def get_center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, (y1 + y2) / 2)


def intersects(box, zone):
    bx1, by1, bx2, by2 = box
    zx1, zy1, zx2, zy2 = zone

    return not (
        bx2 < zx1 or bx1 > zx2 or
        by2 < zy1 or by1 > zy2
    )


def compute_motion(current_centers, prev_centers):
    if not prev_centers or not current_centers:
        return 0.0

    distances = []

    for c in current_centers:
        d = min(
            np.linalg.norm(np.array(c) - np.array(p))
            for p in prev_centers
        )
        distances.append(d)

    motion = float(np.mean(distances))

    # normalize
    return min(motion / 50.0, 1.0)


def extract_features(results, previous_centers):
    """
    Extract motion, people count, exit activity and confidence
    from YOLO detection results
    """

    boxes = results[0].boxes.xyxy.cpu().numpy()
    confs = results[0].boxes.conf.cpu().numpy()
    classes = results[0].boxes.cls.cpu().numpy()

    people_boxes = []
    confidences = []

    model_names = results[0].names

    for box, conf, cls in zip(boxes, confs, classes):
        class_name = model_names[int(cls)]

        if class_name == "person":
            people_boxes.append(box)
            confidences.append(float(conf))

    people_count = len(people_boxes)

    avg_confidence = (
        sum(confidences) / people_count
        if people_count > 0 else 0
    )

    centers = [get_center(b) for b in people_boxes]

    motion_level = compute_motion(centers, previous_centers)

    exit_activity = any(
        intersects(box, zone)
        for box in people_boxes
        for zone in EXIT_ZONES
    )

    features = {
        "people_count": people_count,
        "motion_level": motion_level,
        "exit_activity": exit_activity,
        "avg_confidence": avg_confidence
    }

    return features, centers