FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY client/package*.json ./client/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd client && npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy source code
COPY . .

# Build the client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "backend/server.js"]
