# Exportable proof of the actual .dockerignore-filtered context.
FROM scratch AS context-audit
COPY . /context

############################
# 1. Build stage (Vite)    #
############################
FROM node:24.14.0-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_DATA_SOURCE=api
ENV VITE_BASE_PATH=/

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-fund --no-audit

# Copy application source
COPY . .

# Build production-ready static assets
RUN test ! -e demo && test ! -e .pages && npm run build && node scripts/assert-release.mjs


############################
# 2. Runtime stage (Nginx) #
############################
FROM nginx:1.27-alpine AS runtime

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
