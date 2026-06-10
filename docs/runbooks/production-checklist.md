# Production Deployment Checklist

## 1. Environment Configuration

- [ ] Create `.env.production` file
- [ ] Set strong random `JWT_SECRET` (min 32 characters)
- [ ] Set secure database password
- [ ] Set secure MinIO credentials
- [ ] Configure `LLM_API_KEY` if using real AI
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` for your domain

## 2. Database

- [ ] PostgreSQL 16+ installed and running
- [ ] Database created with proper encoding (UTF-8)
- [ ] pgvector extension installed
- [ ] Database user with limited permissions
- [ ] Regular backup schedule configured
- [ ] Backup restoration tested

## 3. Redis

- [ ] Redis 7+ installed and running
- [ ] Password protection enabled
- [ ] Persistence configured (AOF/RDB)
- [ ] Memory limits set

## 4. MinIO

- [ ] MinIO installed and running
- [ ] Access/secret keys configured
- [ ] Bucket created for file storage
- [ ] CORS configured if needed

## 5. Application

- [ ] `pnpm install` completed
- [ ] `pnpm build` completed
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Seed data loaded: `npx prisma db seed`
- [ ] Environment variables validated on startup

## 6. Web Server (Nginx)

- [ ] Nginx configured as reverse proxy
- [ ] SSL/TLS certificate installed
- [ ] HTTPS redirect configured
- [ ] Rate limiting enabled
- [ ] Security headers added
- [ ] Gzip compression enabled

## 7. Security

- [ ] No default passwords in code
- [ ] No hardcoded secrets
- [ ] JWT_SECRET is strong random string
- [ ] Visitor tokens are signed
- [ ] RBAC enforced on all endpoints
- [ ] Tenant isolation verified
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React)

## 8. Monitoring

- [ ] Health endpoint accessible: `/api/health/ready`
- [ ] Log aggregation configured
- [ ] Error tracking configured
- [ ] Uptime monitoring configured
- [ ] Database connection monitoring
- [ ] Redis connection monitoring

## 9. Backup & Recovery

- [ ] Backup script tested: `scripts/ops/backup.sh`
- [ ] Restore script tested: `scripts/ops/restore.sh`
- [ ] Backup schedule configured (daily recommended)
- [ ] Backup retention policy set (7 days minimum)
- [ ] Off-site backup configured

## 10. DNS & Domain

- [ ] Domain configured
- [ ] DNS records set (A/CNAME)
- [ ] SSL certificate valid
- [ ] www redirect configured (if needed)

## 11. Performance

- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Cache strategy implemented
- [ ] Static assets served via CDN (optional)
- [ ] Image optimization enabled

## 12. Documentation

- [ ] Deployment guide updated
- [ ] Runbook for common issues
- [ ] Contact information for on-call
- [ ] escalation procedures documented

## Environment Variables Reference

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<random-32-chars>
ADMIN_PASSWORD=<secure-password>
AGENT_PASSWORD=<secure-password>

# Optional
REDIS_URL=redis://host:6379
MINIO_ENDPOINT=host
MINIO_PORT=9000
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
LLM_PROVIDER=mock|openai-compatible
LLM_API_KEY=<api-key>
LLM_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-4
PORT=3001
CORS_ORIGIN=https://your-domain.com
```

## Quick Commands

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Backup database
./scripts/ops/backup.sh

# Restore database
./scripts/ops/restore.sh ./backups/backup_20260611_120000.sql.gz

# Health check
curl http://localhost:3001/api/health/ready
```
