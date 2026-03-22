#!/bin/bash
set -e

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Build with loaded env variables
docker build \
  --build-arg PUBLIC_SUPABASE_URL="${PUBLIC_SUPABASE_URL}" \
  --build-arg PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="${PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}" \
  -t opensurveillancedb-ui:latest \
  . \
  "$@"
