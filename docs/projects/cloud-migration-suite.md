# Cloud Migration Suite — Technical Documentation

## 1. Project Overview

**Role**: Full-Stack/Cloud Engineer  
**Duration**: 2023–2024  
**Organization**: Astin IT Solutions  
**Scale**: 3+ client applications migrated to AWS/Azure

## 2. Architecture & Design Decisions

### 2.1 Migration Assessment Framework

Each application was evaluated against 5 dimensions to determine migration strategy:

| Dimension | Criteria | Weight |
|-----------|----------|--------|
| Coupling | Dependency to infrastructure (OS, hardware, network) | 30% |
| Statefulness | Session state, local storage usage | 25% |
| Data Volume | Database size, migration complexity | 20% |
| Compliance | Regulatory requirements, data residency | 15% |
| Business Criticality | Downtime tolerance, rollback requirements | 10% |

**Decision Matrix:**
- Score 0–30% → **Rearchitect** (full cloud-native rewrite)
- Score 31–70% → **Refactor** (modularise and containerise)
- Score 71–100% → **Rehost** (lift-and-shift)

### 2.2 Target Architecture (Microservices)

```yaml
# Sample docker-compose.override.yml for local development
services:
  api-gateway:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - auth-service
      - product-service
      - order-service

  auth-service:
    build: ./services/auth
    environment:
      - DB_HOST=postgres-auth
      - REDIS_URL=redis://redis:6379
    ports:
      - "4001:4001"
    depends_on:
      - postgres-auth
      - redis

  product-service:
    build: ./services/product
    environment:
      - DB_HOST=postgres-products
      - CACHE_ENABLED=true
    ports:
      - "4002:4002"
    depends_on:
      - postgres-products
      - redis

  order-service:
    build: ./services/order
    environment:
      - DB_HOST=postgres-orders
      - PAYMENT_SERVICE_URL=http://payment-service:4004
    ports:
      - "4003:4003"
    depends_on:
      - postgres-orders
      - payment-service
```

### 2.3 Kubernetes Deployment Manifest

```yaml
# Sample deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: "astin/api-gateway:latest"
          ports:
            - containerPort: 443
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: NODE_ENV
              value: "production"
```

## 3. CI/CD Pipeline Architecture

### 3.1 Pipeline Stages

```yaml
# .github/workflows/deploy.yml — Simplified
name: Deploy to Production
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit

      - name: Build Docker image
        run: docker build -t app:${{ github.sha }} .

      - name: Security scan
        run: trivy image app:${{ github.sha }}

      - name: Push to registry
        run: docker push registry.example.com/app:${{ github.sha }}

  deploy-staging:
    needs: build-and-test
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging (ECS/AKS)
        run: |
          aws eks update-kubeconfig --region us-east-1 --name staging
          kubectl set image deployment/app app=registry.example.com/app:${{ github.sha }}
          kubectl rollout status deployment/app

      - name: Integration tests
        run: npm run test:integration

      - name: Performance tests
        run: npm run test:performance

  deploy-production:
    needs: deploy-staging
    environment: production
    runs-on: ubuntu-latest
    steps:
      - name: Blue-Green Deploy
        run: |
          # Deploy to inactive environment
          kubectl apply -f k8s/production/blue-green.yaml \
            --namespace production

          # Wait for healthy
          kubectl rollout status deployment/app-v2 \
            --namespace production --timeout=5m

          # Switch traffic
          kubectl patch service app \
            -p '{"spec":{"selector":{"version":"v2"}}}' \
            --namespace production

          # Drain old
          kubectl scale deployment app-v1 \
            --replicas=0 --namespace production
```

## 4. Data Migration Strategy

### 4.1 Database Migration Process

For zero-downtime data migration:

```
Phase 1: Schema Sync
         On-prem DB → Cloud DB (schema only, no data)

Phase 2: Dual-Write
         Application writes to both databases simultaneously
         Reads from on-prem (source of truth)

Phase 3: Backfill
         Batch job migrates historical data
         Verify row counts match

Phase 4: Cutover
         Switch reads to cloud DB
         Validate data integrity
         Decommission on-prem DB
```

### 4.2 Migration Script Example

```python
# Simplified data migration script
import psycopg2
import boto3

def migrate_table(source_conn, target_conn, table_name, batch_size=5000):
    cursor = source_conn.cursor(f"migrate_{table_name}")
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    total_rows = cursor.fetchone()[0]

    migrated = 0
    offset = 0

    while offset < total_rows:
        cursor.execute(
            f"SELECT * FROM {table_name} ORDER BY id LIMIT {batch_size} OFFSET {offset}"
        )
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        # Transform for cloud target
        transformed = [transform_row(row, columns) for row in rows]

        # Batch insert into target
        insert_batch(target_conn, table_name, columns, transformed)

        migrated += len(rows)
        offset += batch_size
        print(f"Migrated {migrated}/{total_rows}")

    target_conn.commit()
    print(f"Migration complete for {table_name}")
```

## 5. Observability & Monitoring

### 5.1 Logging Architecture

```yaml
# AWS CloudWatch configuration
logging:
  pattern: json
  retention: 90 days
  sources:
    - Application logs (stdout/stderr)
    - Access logs (API gateway)
    - Audit logs (data access)
    - Infrastructure logs (container events)
  alerts:
    error_rate:
      threshold: >5%
      action: PagerDuty notification
    latency_p95:
      threshold: >500ms
      action: Slack alert
```

### 5.2 Metrics Dashboard

| Metric | Tool | Threshold |
|--------|------|-----------|
| CPU Utilization | CloudWatch | <70% |
| Memory Usage | CloudWatch | <80% |
| Request Latency p95 | CloudWatch | <300ms |
| Error Rate | CloudWatch | <1% |
| Database Connections | RDS Monitoring | <80% of max |
| 5xx Errors | CloudWatch | 0 |

## 6. Cost Optimization

### 6.1 Infrastructure Cost Savings

Before migration (on-premise):
- Fixed capacity: $15,000/month
- Maintenance overhead: $5,000/month
- Datacenter costs: $3,000/month
- **Total**: ~$23,000/month

After migration (cloud):
- Auto-scaled EC2/ECS: $8,000/month
- RDS databases: $4,000/month
- Other services: $3,000/month
- **Total**: ~$15,000/month

**Savings**: ~35% reduction in infrastructure costs

## 7. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Legacy database schema not designed for horizontal scaling | Implemented read replicas and sharding strategy |
| Session management in stateful monolith | Migrated to Redis-based distributed session store |
| Zero-downtime cutover required for production | Blue-green deployment with feature flags |
| Team unfamiliar with cloud-native patterns | Conducted training sessions and pair-programming |
| Data consistency during dual-write phase | Implemented CDC (Change Data Capture) with Debezium |

## 8. Key Learnings

1. **Migration is as much about people as technology**: Training and team readiness is critical
2. **Containerize early**: Dockerizing before migration simplifies the process significantly
3. **Test the cutover repeatedly**: Practice runways (pre-production cutover drills) catch issues early
4. **Monitoring needs to be in place before migration**: Not after
5. **Feature flags enable safe rollouts**: They reduced risk for every deployment

---

*This document serves as a portfolio reference. Implementation specifics are proprietary to Astin IT Solutions and its clients.*
