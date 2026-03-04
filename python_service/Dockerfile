FROM python:3.10-slim

WORKDIR /app

# wget + unzip only needed to download the pre-trained ONNX model bundle
RUN apt-get update && apt-get install -y --no-install-recommends wget unzip \
    && rm -rf /var/lib/apt/lists/*

# All pure pre-built wheels — zero C++ compilation, ~120MB total
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download insightface buffalo_sc ONNX model bundle (~15MB)
# Contains: det_500m.onnx (face detection) + w600k_mbf.onnx (MobileFaceNet embeddings)
# This is an HTTP download, NOT compilation — works in GitHub Actions and on Render
RUN wget -q -O /tmp/buffalo_sc.zip \
      "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_sc.zip" \
    && mkdir -p /app/models \
    && unzip -q /tmp/buffalo_sc.zip -d /app/models \
    && rm /tmp/buffalo_sc.zip

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
