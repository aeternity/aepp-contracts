FROM node:16.16.0 as builder

WORKDIR /app

COPY . .

ENV NODE_ENV=prod
RUN npm install
RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
