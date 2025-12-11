# Flaming Hot Auditor - Backend Dockerfile
# Uses Chainguard Python image for security

FROM cgr.dev/chainguard/python:latest-dev

WORKDIR /app

# Install dependencies using pip with user flag (Chainguard runs as nonroot)
RUN pip install --no-cache-dir --user flask flask-cors requests gunicorn

# Copy application code with correct ownership
COPY --chown=nonroot:nonroot app.py .

# Set Python path to include user packages
ENV PATH="/home/nonroot/.local/bin:$PATH"
ENV PYTHONPATH="/home/nonroot/.local/lib/python3.14/site-packages"
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 5000

# Override entrypoint and run python
ENTRYPOINT []
CMD ["/usr/bin/python", "app.py"]
