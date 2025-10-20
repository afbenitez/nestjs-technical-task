FROM node:22.13.1-alpine AS builder

WORKDIR /app

# Copy application files
COPY apps/event-tracker/package*.json ./apps/event-tracker/
COPY apps/event-tracker/tsconfig*.json ./apps/event-tracker/
COPY apps/event-tracker/nest-cli.json ./apps/event-tracker/

# Install dependencies
WORKDIR /app/apps/event-tracker
RUN npm install

# Copy source code
COPY apps/event-tracker/src ./src

# Build application
RUN npm run build

# Production stage
FROM node:22.13.1-alpine

WORKDIR /app/apps/event-tracker

# Copy package files
COPY apps/event-tracker/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/apps/event-tracker/dist ./dist

CMD ["node", "dist/main.js"]
