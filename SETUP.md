# Knowledge Garden — Setup & Run Guide

## Prerequisites

- **Node.js** v16+ & **npm** v8+
- **Docker** installed and running

---

## 1. Clone & Initialize Submodules

```bash
git clone <repo-url>
cd Knowledge-Garden
git submodule init && git submodule update
```

---

## 2. Start Docker Infrastructure

### Start all containers at once

```bash
# Consul — Service Discovery (port 8500)
docker start kg-consul || docker run -d -p 8500:8500 --name kg-consul hashicorp/consul

# MongoDB (port 27017)
docker start kg-mongo || docker run -d -p 27017:27017 --name kg-mongo mongo:latest

# MinIO — S3 Storage (ports 9000, 9001)
docker start kg-minio || docker run -d -p 9000:9000 -p 9001:9001 --name kg-minio \
  quay.io/minio/minio server /data --console-address ":9001"

# PostgreSQL (port 5434)
docker start kg-postgres || docker run -d -p 5434:5432 --name kg-postgres \
  -e POSTGRES_PASSWORD=sepr3 -e POSTGRES_DB=kg postgres

# Kafka — Event Messaging (port 9092)
docker start kg-kafka || docker run -d -p 9092:9092 --name kg-kafka \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
  -e KAFKA_NUM_PARTITIONS=1 \
  apache/kafka:3.7.0
```

### Verify all containers are running

```bash
docker ps --filter "name=kg-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

| Container     | Port(s)    | Purpose            |
|---------------|------------|---------------------|
| `kg-consul`   | 8500       | Service Discovery   |
| `kg-mongo`    | 27017      | MongoDB             |
| `kg-minio`    | 9000, 9001 | S3 / Object Storage |
| `kg-postgres` | 5434       | PostgreSQL          |
| `kg-kafka`    | 9092       | Kafka Messaging     |

---

## 3. Configure Environment Variables

From the `backend/` directory:

```bash
cd backend
cp .env.example authentication/.env
cp authentication/.env api-gateway/.env
cp authentication/.env resources/.env
cp authentication/.env search/.env
```

> **Note:** Edit each `.env` file if you need to change passwords, ports, or credentials. The default `POSTGRES_PORT` is `5434`.

---

## 4. Install Dependencies

### Backend

```bash
cd backend/api-gateway    && npm install
cd ../authentication      && npm install
cd ../resources           && npm install
cd ../search              && npm install
cd ../..
```

### Frontend

```bash
cd frontend && npm install && cd ..
```

---

## 5. Run the Backend (4 microservices)

Open **4 separate terminals** or run them in the background:

```bash
# Terminal 1 — API Gateway (port 5000)
cd backend/api-gateway && npm run dev

# Terminal 2 — Authentication Service (port 5001)
cd backend/authentication && npm run dev

# Terminal 3 — Resources Service (port 3000)
cd backend/resources && npm run dev

# Terminal 4 — Search Service (port 5002)
cd backend/search && npm run dev
```

### One-liner (run all in background)

```bash
cd backend && \
  (cd api-gateway && npm run dev &) && \
  (cd authentication && npm run dev &) && \
  (cd resources && npm run dev &) && \
  (cd search && npm run dev &)
```

---

## 6. Run the Frontend

```bash
cd frontend && npm run dev
```

The frontend will start on `http://localhost:5173` (default Vite port).

---

## 7. Health Checks

```bash
curl http://localhost:5000/health   # API Gateway
curl http://localhost:5001/health   # Authentication
curl http://localhost:3000/health   # Resources
curl http://localhost:5002/health   # Search
```

---

## 8. Stop Everything

### Stop backend services
Press `Ctrl+C` in each terminal, or kill background jobs:
```bash
kill $(jobs -p)
```

### Stop Docker containers
```bash
docker stop kg-consul kg-mongo kg-minio kg-postgres kg-kafka
```

---

## Quick Reference

| Component          | URL / Port                   |
|--------------------|------------------------------|
| API Gateway        | `http://localhost:5000`       |
| Auth Service       | `http://localhost:5001`       |
| Resources Service  | `http://localhost:3000`       |
| Search Service     | `http://localhost:5002`       |
| Frontend           | `http://localhost:5173`       |
| Consul UI          | `http://localhost:8500/ui`    |
| MinIO Console      | `http://localhost:9001`       |
| Swagger API Docs   | `http://localhost:5000/api-docs` |
