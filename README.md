# NestJS RabbitMQ Telegram Microservices

## Description

This project demonstrates a microservice architecture based on NestJS, RabbitMQ, Docker and Telegram Bot API.

The system contains three services:

- Producer Service: accepts HTTP requests and publishes notification events to RabbitMQ.
- Consumer Service: consumes events from RabbitMQ, handles idempotency, retries, logging and calls Telegram Service.
- Telegram Service: sends notifications to Telegram through Telegram Bot API.

## Architecture

```txt
Producer Service -> RabbitMQ -> Consumer Service -> Telegram Service -> Telegram API
```

## Features
- NestJS monorepo
- RabbitMQ producer and consumer
- JSON message serialization
- UUID eventId for idempotency
- Publisher confirmation
- Manual ACK
- Retry queue
- Dead-letter queue
- Telegram Bot API integration
- Docker Compose
- Swagger documentation
- Jest tests

## Requirements

- Node.js 20+
- Docker
- Docker Compose

## Environment

Create .env file:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## Run with Docker

```bash
docker compose up --build
```

## Services

### Producer Swagger
```txt
http://localhost:3000/docs
```
### Telegram Swagger
```txt
http://localhost:3002/docs
```
### RabbitMQ UI
```txt
http://localhost:15672
guest / guest
```

## Test request
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "message": "Hello from NestJS RabbitMQ microservices"
  }'
```

## RabbitMQ topology

### Exchange
```txt
notifications.exchange
```
### Queues
```txt
notifications.queue
notifications.retry.queue
notifications.dlq
```
### Routing keys
```txt
notification.created
notification.retry
notification.failed
```

## Idempotency

Each event contains a unique eventId.

The Consumer Service stores processed event IDs in memory to prevent duplicate processing.

For production usage, this storage should be replaced with Redis, PostgreSQL or another persistent store.

## Retry Logic

If processing fails, the Consumer Service publishes the event to `notifications.retry.queue`.

The retry queue has a TTL of 5 seconds and then routes the message back to the main queue.

After 3 failed attempts, the event is sent to the dead-letter queue.

## Tests
```bash
npm test
```
