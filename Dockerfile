FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=""
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY serve.json ./
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80", "--config", "serve.json"]
