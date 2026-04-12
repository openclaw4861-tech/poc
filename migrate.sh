#!/bin/bash
# Migration runner script
# Run this after deployment to ensure tables exist

cd "$(dirname "$0")"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

echo "Running Drizzle migrations..."
npx drizzle-kit migrate

echo "Migrations complete!"
