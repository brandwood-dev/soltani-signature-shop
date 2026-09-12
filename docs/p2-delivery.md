# P2 delivery

## Media migration

The protected `POST /api/v1/content/admin/images/migrate-legacy` endpoint migrates legacy hero, brand, banner and fixed site images into Supabase Storage. It only downloads the previously configured `res.cloudinary.com` host, then stores WebP and AVIF responsive variants. The **Optimiser les anciennes images** action in the admin Hero page starts the migration.

## Release workflow

The `Production Delivery` workflow is intentionally manual until the production environment contains:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`.

The API deploy remains managed by Render. Render applies committed Prisma migrations through `prisma migrate deploy` before starting the API, and its health check now verifies `/api/v1/health/ready`, including `SELECT 1` against PostgreSQL.

The workflow builds and tests the frontend, deploys the Worker with the commit SHA, validates the public version, homepage and API readiness, then invokes the documented Wrangler rollback command if verification fails. Database migrations remain forward-compatible because a Worker rollback does not undo database changes.
