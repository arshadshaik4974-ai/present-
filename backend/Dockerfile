FROM python:3.11-slim

# Install system dependencies required for OpenCV and other ML tools
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the FastAPI app using uvicorn
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
