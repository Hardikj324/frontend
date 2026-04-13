# --- Build Stage ---
FROM node:20-alpine as builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .

# Set production API URL at build time
ENV VITE_API_URL=/api
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
