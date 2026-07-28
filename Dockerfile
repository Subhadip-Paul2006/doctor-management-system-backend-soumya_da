FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# Generate Prisma Client inside the image (uses schema, not a live DB connection)
RUN npx prisma generate

EXPOSE 8000

CMD ["node", "src/server.js"]