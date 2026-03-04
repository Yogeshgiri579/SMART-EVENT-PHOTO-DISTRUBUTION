FROM python:3.10-slim

# No cmake, no build-essential — pure Python wheels, no C++ compilation
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Facenet model weights at build time so runtime starts fast
# and avoids any cold-start memory spike from downloading on first request
RUN python -c "from deepface import DeepFace; DeepFace.build_model('Facenet')"

COPY . .

EXPOSE 8000

# Single worker — stays within 512MB RAM on Render free tier
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
