# Flaming Hot Auditor - Frontend Dockerfile
# Uses Chainguard Node image for security

FROM cgr.dev/chainguard/node:latest-dev AS builder

WORKDIR /app

# Copy package files with correct ownership
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy source files with correct ownership
COPY --chown=node:node . .

# Build the app (for production)
# RUN npm run build

# Development stage - we use the dev server for hot reload
FROM cgr.dev/chainguard/node:latest-dev

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./

# Copy source files (will be overwritten by volume mount in dev)
COPY --chown=node:node . .

# Expose Vite dev server port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]

