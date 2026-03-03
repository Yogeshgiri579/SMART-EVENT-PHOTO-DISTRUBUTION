from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests
import face_recognition
import numpy as np
from typing import Optional
import logging
import gc
import io
from PIL import Image

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

app = FastAPI()

# face_recognition (dlib) loads lazily — no startup model preload needed.
# Total runtime memory: ~150MB vs DeepFace+TF at ~400MB.

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate-embeddings")
async def generate_embeddings(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        # ── Load image ─────────────────────────────────────────────────────
        img_array = None

        if file:
            contents = await file.read()
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
            img_array = np.array(pil_image)

        elif url:
            response = requests.get(url, timeout=15)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch image from URL")
            pil_image = Image.open(io.BytesIO(response.content)).convert("RGB")
            img_array = np.array(pil_image)

        else:
            raise HTTPException(status_code=400, detail="Must provide url or file")

        if img_array is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        # ── Detect face locations ───────────────────────────────────────────
        # model="hog" is faster + lighter than "cnn" — important on free tier
        face_locations = face_recognition.face_locations(img_array, model="hog")

        if not face_locations:
            return JSONResponse(status_code=200, content={"faces": []})

        # ── Generate 128-dim embeddings (same dimensionality as Facenet) ───
        face_encodings = face_recognition.face_encodings(img_array, face_locations)

        faces = []
        for encoding, location in zip(face_encodings, face_locations):
            top, right, bottom, left = location
            faces.append({
                "embedding": encoding.tolist(),          # 128-dim float list
                "bounding_box": {                         # Same format as before
                    "x": left,
                    "y": top,
                    "w": right - left,
                    "h": bottom - top
                },
                "confidence": 1.0                         # dlib doesn't return confidence scores
            })

        return JSONResponse(status_code=200, content={"faces": faces})

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating embeddings")
    finally:
        # Release memory after every request
        gc.collect()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
