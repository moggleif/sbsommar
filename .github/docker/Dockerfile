FROM node:20

WORKDIR /app

# Copy only package files to leverage Docker layer caching.
COPY package.json package-lock.json ./

# Install production dependencies only (js-yaml, marked, qrcode).
RUN npm ci --omit=dev

# The repository is mounted at runtime via actions/checkout,
# so no application source is baked into the image.
