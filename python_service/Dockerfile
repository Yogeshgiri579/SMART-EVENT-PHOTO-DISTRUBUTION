FROM animcogn/face_recognition:cpu

WORKDIR /app

COPY requirements.txt .
# face_recognition, dlib, and numpy are pre-installed in the base image
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Single worker — critical for staying within 512MB RAM on Render free tier
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
