FROM node:22-slim

WORKDIR /app

# Copy package files
COPY apps/api/package.json ./

# Install dependencies (including tsx for running TypeScript directly)
RUN npm install --legacy-peer-deps

# Copy source code
COPY apps/api/ ./

# Railway provides PORT automatically - don't hardcode
ENV PORT=3001

# Run TypeScript directly with tsx (avoids ESM .js extension issues with tsc)
CMD ["npx", "tsx", "src/index.ts"]
