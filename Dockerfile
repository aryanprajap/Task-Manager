# ==========================================================
# Task Management System - Production Multi-Stage Dockerfile
# Builds Node.js Backend API & Serves Static Frontend
# ==========================================================

FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY backend/package*.json ./backend/

# Install dependencies inside backend directory
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy application source code
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Expose container port
EXPOSE 3000

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start server entrypoint
WORKDIR /app/backend
CMD ["npm", "start"]
