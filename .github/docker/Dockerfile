FROM node:20

# Copy only package files to leverage Docker layer caching.
COPY package.json package-lock.json /deps/

# Install production dependencies only (js-yaml, marked, qrcode).
RUN cd /deps && npm ci --omit=dev

# Make installed modules visible from any working directory.
# GitHub Actions container jobs run steps in the workspace directory,
# so node_modules must be reachable via NODE_PATH.
ENV NODE_PATH=/deps/node_modules
