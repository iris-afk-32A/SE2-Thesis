from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import numpy as np
import cv2
import os

from helpers.feature import extract_features, EXIT_ZONES

app = FastAPI()

model = YOLO("./model/yolov8n.pt")

previous_centers = []


@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    global previous_centers

    try:
        contents = await file.read()

        np_array = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if image is None:
            return {"error": "Invalid image file"}

        results = model(image)

        # Extract features
        features, centers = extract_features(results, previous_centers)

        previous_centers = centers

        annotated_frame = results[0].plot()

        # Draw exit zones
        for zone in EXIT_ZONES:
            x1, y1, x2, y2 = zone

            cv2.rectangle(
                annotated_frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 255),
                5
            )

            cv2.putText(
                annotated_frame,
                "EXIT",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2
            )

        os.makedirs("./results", exist_ok=True)

        output_path = "./results/annotated_image.jpg"
        cv2.imwrite(output_path, annotated_frame)

        print(f"Features: {features}")

        return {
            "message": "Detection complete",
            "features": features,
            "output_path": output_path
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/health")
def health_check():
    return {"status": "healthy"}