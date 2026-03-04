from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests as http_requests
import numpy as np
import cv2
import io
import logging
import gc
import os
from typing import Optional
from PIL import Image

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

app = FastAPI()

# ── OpenCV Haar cascade for face detection (built into OpenCV, zero download) ──
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# ── MobileFaceNet ONNX model loaded once, lazily ───────────────────────────────
_emb_session = None
EMB_MODEL_PATH = "/app/models/buffalo_sc/w600k_mbf.onnx"

def get_emb_session():
    global _emb_session
    if _emb_session is None:
        import onnxruntime as ort
        _emb_session = ort.InferenceSession(
            EMB_MODEL_PATH,
            providers=["CPUExecutionProvider"]
        )
    return _emb_session


def get_embedding(img_rgb: np.ndarray, x: int, y: int, w: int, h: int) -> list:
    """Crop face, resize to 112x112, run MobileFaceNet, return 512-dim embedding."""
    margin = int(min(w, h) * 0.2)
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(img_rgb.shape[1], x + w + margin)
    y2 = min(img_rgb.shape[0], y + h + margin)

    face_crop = img_rgb[y1:y2, x1:x2]
    if face_crop.size == 0:
        return []

    # Preprocess: resize → [0,255] float → normalize to [-1, 1] → CHW → batch
    face_resized = cv2.resize(face_crop, (112, 112)).astype(np.float32)
    face_norm = (face_resized - 127.5) / 128.0
    input_tensor = np.transpose(face_norm, (2, 0, 1))[np.newaxis]  # [1,3,112,112]

    session = get_emb_session()
    input_name = session.get_inputs()[0].name
    raw = session.run(None, {input_name: input_tensor})[0][0]  # shape [512]

    # L2-normalize so cosine similarity works correctly
    norm = np.linalg.norm(raw)
    embedding = (raw / norm).tolist() if norm > 0 else raw.tolist()
    return embedding


def detect_and_embed(img_rgb: np.ndarray) -> list:
    """Detect all faces in image and return list of {embedding, bounding_box, confidence}."""
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    if not isinstance(faces, np.ndarray) or len(faces) == 0:
        return []

    results = []
    for (x, y, w, h) in faces:
        embedding = get_embedding(img_rgb, int(x), int(y), int(w), int(h))
        if not embedding:
            continue
        results.append({
            "embedding": embedding,       # 512-dim float list
            "bounding_box": {
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h)
            },
            "confidence": 1.0
        })

    return results


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
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
            img_array = np.array(pil_image)

        elif url:
            response = http_requests.get(url, timeout=15)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Could not fetch image from URL")
            pil_image = Image.open(io.BytesIO(response.content)).convert("RGB")
            img_array = np.array(pil_image)

        else:
            raise HTTPException(status_code=400, detail="Must provide url or file")

        faces = detect_and_embed(img_array)
        return JSONResponse(status_code=200, content={"faces": faces})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating embeddings")
    finally:
        gc.collect()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
