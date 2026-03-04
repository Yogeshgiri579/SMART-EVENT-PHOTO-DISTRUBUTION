FROM python:3.10-slim

# No cmake, no build-essential — pure Python wheels only, zero C++ compilation
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Single worker — stays within 512MB RAM on Render free tier
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
