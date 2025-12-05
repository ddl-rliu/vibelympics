# Ultimate Racer Frontend - React with Vite
# Using Chainguard Node image for security

FROM cgr.dev/chainguard/node:latest-dev AS builder

WORKDIR /app

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies using shell entrypoint
RUN ["/bin/sh", "-c", "npm install"]

# Copy source files
COPY --chown=node:node . .

# Development stage - run dev server with hot reload
FROM cgr.dev/chainguard/node:latest-dev

WORKDIR /app

# Copy node_modules and source from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node vite.config.ts ./
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node tailwind.config.js ./
COPY --chown=node:node postcss.config.js ./
COPY --chown=node:node index.html ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public

# Expose port
EXPOSE 3000

# Use shell entrypoint to run vite via node_modules
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["./node_modules/.bin/vite --host 0.0.0.0 --port 3000"]
