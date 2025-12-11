# Flaming Hot Auditor - Frontend Dockerfile
# Uses Chainguard Node image for security

FROM cgr.dev/chainguard/node:latest-dev

WORKDIR /app

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy source files with correct ownership
COPY --chown=node:node . .

# Expose Vite dev server port
EXPOSE 5173

# Override entrypoint and run npm
ENTRYPOINT []
CMD ["/usr/bin/npm", "run", "dev"]
