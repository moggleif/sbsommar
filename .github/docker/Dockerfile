FROM node:20

WORKDIR /deps

# Copy only package files to leverage Docker layer caching.
COPY package.json package-lock.json ./

# Install production dependencies only (js-yaml, marked, qrcode).
RUN npm ci --omit=dev

# Make installed modules visible from any working directory.
# actions/checkout places the repo in /github/workspace (container default),
# so node_modules must be reachable via NODE_PATH.
ENV NODE_PATH=/deps/node_modules
