#!/bin/bash

set -e

echo "Linting code..."
pnpm nx run-many --target=lint --all
echo "Lint complete!"
