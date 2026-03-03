from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests
from deepface import DeepFace
import cv2
import numpy as np
from typing import Optional
import os
import logging
import gc

# Disable logging for embeddings to ensure no sensitive data is printed
logging.getLogger("deepface").setLevel(logging.ERROR)

app = FastAPI()

# NOTE: Model is loaded lazily on first request (not at startup)
# to stay within Render's 512MB free tier memory limit.
# First request will be slow (~10-20s) while the model loads.

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate-embeddings")
async def generate_embeddings(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        img_array = None
        if file:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif url:
            # Add timeout handling
            response = requests.get(url, timeout=15)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch image from URL")
            nparr = np.frombuffer(response.content, np.uint8)
            img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            raise HTTPException(status_code=400, detail="Must provide url or file")

        if img_array is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        try:
            results = DeepFace.represent(img_path=img_array, model_name="Facenet", enforce_detection=False)
        except ValueError as e:
            # DeepFace raises ValueError if no face is found and enforce_detection is True
            # With enforce_detection=False, it might still return a result but with face_confidence=0
            results = []

        faces = []
        # If no face is found, results might be a dict instead of list, or list of dicts with confidence=0
        if isinstance(results, dict):
            results = [results]
            
        for face in results:
            confidence = face.get("face_confidence", 0)
            if confidence > 0.0:  # Valid face detected
                faces.append({
                    "embedding": face.get("embedding", []),
                    "bounding_box": face.get("facial_area", {}),
                    "confidence": confidence
                })

        return JSONResponse(status_code=200, content={"faces": faces})

    except HTTPException as he:
        raise he
    except Exception as e:
        # Avoid logging embedding vectors; only structural error
        print(f"Error processing image generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating embeddings")
    finally:
        # Explicitly free memory after each request (critical on 512MB free tier)
        gc.collect()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
