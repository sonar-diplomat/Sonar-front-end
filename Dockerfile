############################
# 1. Build stage (Vite)    #
############################
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-fund --no-audit

# Copy application source
COPY . .

# Build production-ready static assets
RUN npm run build


############################
# 2. Runtime stage (Nginx) #
############################
FROM nginx:1.27-alpine

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]