# ==========================================================
# Task Management System - Backend Dockerfile
# Multi-stage optimized Node.js Alpine container
# ==========================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY backend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy backend application source code
COPY backend/ ./

# Expose Express server port
EXPOSE 5000

# Production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck for container status verification
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the Node.js Express server
CMD ["npm", "start"]
