#!/usr/bin/env bash
set -euo pipefail

url="https://tp5-backend-prod-soficontrerass.azurewebsites.net/health"
max_attempts=12
delay=5

echo "Health check backend PROD → $url"

for i in $(seq 1 "$max_attempts"); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  echo "Attempt $i: $status"
  if [ "$status" = "200" ]; then
    echo "Health check passed"
    exit 0
  fi
  sleep "$delay"
done

echo "Health check failed"
exit 1