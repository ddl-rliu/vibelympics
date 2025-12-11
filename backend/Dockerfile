# Flaming Hot Auditor - Backend Dockerfile
# Uses Chainguard Python image for security

FROM cgr.dev/chainguard/python:latest-dev AS builder

# Set working directory
WORKDIR /app

# Install uv for package management
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY --chown=nonroot:nonroot pyproject.toml .

# Install dependencies using uv
RUN uv pip install --system -e .

# Production stage
FROM cgr.dev/chainguard/python:latest-dev

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /home/nonroot/.local /home/nonroot/.local

# Copy application code with correct ownership
COPY --chown=nonroot:nonroot app.py .

# Set Python path
ENV PATH="/home/nonroot/.local/bin:$PATH"
ENV PYTHONPATH="/home/nonroot/.local/lib/python3.12/site-packages"
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]

