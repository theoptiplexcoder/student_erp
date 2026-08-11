#!/bin/bash

set -e

echo "Starting development servers..."
pnpm nx run-many --target=dev --all
