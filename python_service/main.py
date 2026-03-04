from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import uvicorn
import requests
import numpy as np
from typing import Optional
import logging
import gc
import io
import os
from PIL import Image

# Suppress TensorFlow / deepface noise in logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["DEEPFACE_HOME"] = "/app/.deepface"

from deepface import DeepFace

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

app = FastAPI()

# Model is loaded lazily on the first request.
# On Render free tier the first request will take ~10-15s while Facenet downloads (~90MB).
# Subsequent requests are fast. The /health endpoint does NOT trigger model load.

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

        # ── Detect faces + generate 128-dim Facenet embeddings ─────────────
        # enforce_detection=False → returns empty list instead of raising when no face found
        # detector_backend="opencv" → lightweight, pure-Python, no dlib or C++ compilation
        result = DeepFace.represent(
            img_path=img_array,
            model_name="Facenet",         # 128-dim, matches existing DB schema
            detector_backend="opencv",    # Fast + no native compilation needed
            enforce_detection=False,
            align=True
        )

        if not result:
            return JSONResponse(status_code=200, content={"faces": []})

        faces = []
        for r in result:
            embedding = r.get("embedding")
            area = r.get("facial_area", {})

            # Skip entries with no detected face (enforce_detection=False can yield ghost entries)
            if not embedding or area.get("w", 0) == 0:
                continue

            faces.append({
                "embedding": embedding,           # 128-dim float list
                "bounding_box": {                 # Same format as before — no changes needed in Node
                    "x": area.get("x", 0),
                    "y": area.get("y", 0),
                    "w": area.get("w", 0),
                    "h": area.get("h", 0)
                },
                "confidence": r.get("face_confidence", 1.0)
            })

        return JSONResponse(status_code=200, content={"faces": faces})

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error generating embeddings")
    finally:
        gc.collect()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
