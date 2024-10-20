FROM node:20-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=prod
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
