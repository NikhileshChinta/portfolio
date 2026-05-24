# API Platform — Technical Documentation

## 1. Project Overview

**Role**: Backend/API Engineer  
**Duration**: 2023–2024  
**Organization**: Astin IT Solutions  
**Scale**: 1M+ requests/month, 99.9% uptime

## 2. Architecture Overview

### 2.1 System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     Load Balancer (ALB)                         │
│               SSL termination, health checks                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   API Gateway (Kong/Express)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │  Auth    │ │  Rate    │ │  Cache   │ │  Request Transform │ │
│  │  (OAuth2)│ │  Limit   │ │  (Redis) │ │  Version Mapping   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
└────────────┬───────────────────┬──────────────────┬─────────────┘
             │                   │                  │
     ┌───────▼───────┐   ┌──────▼──────┐   ┌──────▼───────┐
     │  REST API     │   │  GraphQL    │   │  Webhook     │
     │  /api/v1/*    │   │  /graphql   │   │  /webhooks/* │
     │  Express.js   │   │  Apollo     │   │  Express     │
     └───────┬───────┘   └──────┬──────┘   └──────┬───────┘
             │                  │                  │
     ┌───────▼──────────────────▼──────────────────▼───────┐
     │               Backend Services                       │
     │  Auth · User · Product · Order · Payment · Notif     │
     └───────┬──────────────────┬──────────────────┬────────┘
             │                  │                  │
     ┌───────▼───────┐   ┌──────▼──────┐   ┌──────▼───────┐
     │  PostgreSQL   │   │   Redis     │   │   SQS/SNS    │
     │  (Primary DB) │   │  (Cache)    │   │  (Queues)    │
     └───────────────┘   └─────────────┘   └──────────────┘
```

### 2.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Express.js vs Fastify | Chose Express for ecosystem maturity and community support |
| REST + GraphQL dual support | REST for simple CRUD, GraphQL for complex frontend queries |
| Kong API Gateway | Needed rate limiting, auth, and caching at gateway level |
| PostgreSQL + Redis | PostgreSQL for ACID compliance; Redis for sub-millisecond cache |
| JWT vs Session | JWT for stateless auth, easier horizontal scaling |

## 3. Authentication & Authorization

### 3.1 OAuth2 Flow

```javascript
// OAuth2 Authorization Code Flow
const oauth2 = require('oauth2-server');

const oauth = new OAuth2({
  model: {
    // Grant validation
    getClient: async (clientId, clientSecret) => {
      return db.clients.findById(clientId);
    },
    saveToken: async (token, client, user) => {
      token.client = client;
      token.user = user;
      return db.tokens.save(token);
    },
    getAccessToken: async (accessToken) => {
      return db.tokens.findByAccessToken(accessToken);
    },
    verifyScope: async (token, scope) => {
      return token.scopes.includes(scope);
    },
  },
  // Access token duration
  accessTokenLifetime: 3600, // 1 hour
  refreshTokenLifetime: 1209600, // 14 days
});

// Middleware chain
router.post('/auth/token', oauth.token());
router.get('/api/v1/users',
  oauth.authenticate({ scope: 'users:read' }),
  usersController.list
);
```

### 3.2 RBAC Implementation

```javascript
// Role-Based Access Control middleware
const rbacMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    const { user } = req;

    // User roles: admin, manager, developer, viewer
    const roleHierarchy = {
      admin: 100,
      manager: 80,
      developer: 60,
      viewer: 40,
    };

    if (roleHierarchy[user.role] >= roleHierarchy[requiredRole]) {
      return next();
    }

    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Insufficient permissions',
    });
  };
};

// Usage
router.get('/api/v1/admin/users',
  authenticate({ scope: 'admin:read' }),
  rbacMiddleware('admin'),
  adminController.listUsers
);
```

## 4. Rate Limiting

### 4.1 Implementation

```javascript
const rateLimit = require('express-rate-limit');

// Tier-based rate limiting
const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'ratelimit:',
  }),
  keyGenerator: (req) => req.user?.id || req.ip,
  windowMs: 60 * 1000, // 1 minute window
  max: (req) => {
    // Tier-based limits
    const limits = {
      free: 30,        // 30 req/min
      basic: 100,      // 100 req/min
      premium: 500,    // 500 req/min
      enterprise: 1000, // 1000 req/min
    };
    return limits[req.user?.tier] || limits.free;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
    });
  },
});

// Apply to all /api/v1/* routes
router.use('/api/v1', rateLimiter);
```

## 5. Caching Strategy

### 5.1 Redis Cache Layer

```javascript
// Cache-aside pattern implementation
const cache = {
  get: async (key) => {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  },

  set: async (key, value, ttlSeconds = 300) => {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  invalidate: async (pattern) => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Usage in controller
async function getProduct(req, res) {
  const { id } = req.params;
  const cacheKey = `product:${id}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Cache miss — fetch from DB
  const product = await db.products.findById(id);
  if (!product) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  // Store in cache
  await cache.set(cacheKey, product);

  return res.json(product);
}
```

## 6. Payment Integration

### 6.1 Webhook Processing

```javascript
// Idempotent webhook handler
async function handleWebhook(req, res) {
  const { idempotencyKey } = req.headers;
  const payload = req.body;

  // Check if already processed
  const existing = await db.webhookLogs.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return res.status(200).json({ status: 'ALREADY_PROCESSED' });
  }

  // Store webhook event (for retry tracking)
  await db.webhookLogs.create({
    idempotencyKey,
    provider: payload.provider,
    event: payload.event,
    rawBody: payload,
    status: 'PROCESSING',
  });

  try {
    // Process payment event
    switch (payload.event) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(payload.data);
        break;
      case 'payment_intent.failed':
        await handlePaymentFailure(payload.data);
        break;
      case 'charge.refunded':
        await handleRefund(payload.data);
        break;
    }

    // Mark success
    await db.webhookLogs.update(idempotencyKey, { status: 'COMPLETED' });
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    // Mark for retry
    await db.webhookLogs.update(idempotencyKey, {
      status: 'FAILED',
      error: error.message,
    });
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}
```

### 6.2 Retry with Dead-Letter Queue

```yaml
# SQS configuration for failed payment processing
payment-queue:
  queue: standard
  retries: 3
  retry-delay: exponential (30s, 2min, 10min)
  dlq:
    name: payment-failed-dlq
    max-receives: 3
    retention: 14 days
  monitoring:
    alarm: dlq-not-empty
    action: Slack + PagerDuty
```

## 7. Error Handling

### 7.1 Unified Error Response Format

```javascript
// Standardized error handling
class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  const response = {
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(err.statusCode || 500).json(response);
};
```

## 8. API Documentation (OpenAPI Example)

```yaml
openapi: 3.0.0
info:
  title: API Platform
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      summary: List users
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Paginated list of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
```

## 9. Performance & Scalability

### 9.1 Load Testing Results

```bash
# Artillery load test summary
$ artillery run load-test.yml

Summary report @ 2024-01-15
  http.codes.200: 500,000
  http.codes.429: 2,100
  http.codes.500: 12
  http.request_rate: 4,500 req/s
  http.response_time:
    min: 15
    max: 890
    median: 45
    p95: 120
    p99: 300
  scenarios:
    - created: 50,000
    - completed: 49,988
    - failed: 12
```

### 9.2 Horizontal Scaling Config

```yaml
# Auto-scaling policy
auto-scaling:
  target: API Node Pool
  min-replicas: 3
  max-replicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  cool-down:
    scale-up: 60s
    scale-down: 300s
```

## 10. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Cold start for serverless functions | Switched from Lambda to ECS Fargate with min 3 replicas |
| Webhook duplicate events | Idempotency keys with deduplication in PostgreSQL |
| JWT token revocation during breach | Token blacklist in Redis with 15-minute TTL |
| Rate limiting accuracy under high load | Switched from in-memory to Redis-backed rate limiting |
| Cross-service query performance | Implemented GraphQL DataLoader for N+1 prevention |

## 11. Key Learnings

1. **API Gateway is critical early investment**: It paid off for auth, rate limiting, and routing
2. **Idempotency is non-negotiable for payments**: Every payment endpoint must be idempotent
3. **Cache invalidation is the hardest problem**: Use TTLs and pattern-based invalidation
4. **GraphQL + REST is powerful but adds complexity**: Need clear guidelines on which to use when
5. **Load test before every major release**: Catch performance regressions before they reach users

---

*This document serves as a portfolio reference. Implementation specifics are proprietary to Astin IT Solutions and its clients.*
