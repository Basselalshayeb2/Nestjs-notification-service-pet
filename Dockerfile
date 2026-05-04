FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG APP_NAME
RUN npm run build ${APP_NAME}

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

CMD node dist/apps/${APP_NAME}/main.js