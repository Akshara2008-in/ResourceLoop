
# Stage 1: Install production dependencies
FROM node:24-alpine AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# Stage 2: Create a minimal runtime image
FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Remove npm, npx, Corepack and bundled package managers
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /usr/local/bin/yarn \
    /opt/yarn-v1.22.22

# Copy only the Node.js executable
COPY --from=builder /usr/local/bin/node /usr/local/bin/node

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node . .

# Run as non-root user
USER node

EXPOSE 5050

# Check backend health
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5050/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start backend directly without npm
CMD ["node", "server.js"]
