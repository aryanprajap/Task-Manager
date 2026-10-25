# ==========================================================
# Task Management System - Production Dockerfile
# Serves Backend REST API and Frontend UI on port 3000
# ==========================================================

FROM node:20-alpine

# Set root application directory
WORKDIR /app

# Copy backend dependencies first for layer caching
COPY backend/package*.json ./backend/

# Install dependencies inside backend directory
WORKDIR /app/backend
RUN npm install --omit=dev

# Return to /app and copy backend and frontend code
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start server from backend directory
WORKDIR /app/backend
CMD ["npm", "start"]
