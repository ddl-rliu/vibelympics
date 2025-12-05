# Ultimate Racer Backend - Flask API
# Using Chainguard Python image for security

FROM cgr.dev/chainguard/python:latest-dev AS builder

WORKDIR /app

# Copy requirements file
COPY --chown=nonroot:nonroot requirements.txt .

# Install dependencies to user space
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM cgr.dev/chainguard/python:latest-dev

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /home/nonroot/.local /home/nonroot/.local

# Copy application source
COPY --chown=nonroot:nonroot src/ ./src/

# Add user site-packages to Python path
ENV PATH="/home/nonroot/.local/bin:$PATH"
ENV PYTHONPATH="/app/src:/home/nonroot/.local/lib/python3.14/site-packages"
ENV FLASK_APP=/app/src/app.py
ENV FLASK_ENV=development

# Expose port
EXPOSE 5000

# Run the Flask app with hot reload using the flask script directly
CMD ["/home/nonroot/.local/bin/flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]
