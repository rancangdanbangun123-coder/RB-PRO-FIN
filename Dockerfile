FROM node:22-slim

WORKDIR /app

# Copy package files
COPY apps/api/package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY apps/api/ ./

# Build TypeScript
RUN npm run build

# Railway provides PORT automatically - don't hardcode
ENV PORT=3001

# Start the server
CMD ["node", "dist/index.js"]
