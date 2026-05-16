#!/bin/sh
set -e

echo "==> Pushing schema to database..."
./node_modules/.bin/prisma db push --skip-generate --accept-data-loss

echo "==> Seeding database..."
./node_modules/.bin/tsx prisma/seed.ts && echo "   Seed complete." || echo "   Seed skipped (already seeded)."

echo "==> Starting Next.js..."
exec node server.js
