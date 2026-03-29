# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (layer caching for dependencies)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
