#!/bin/bash

set -e

echo "Formatting code..."
pnpm prettier --write .
echo "Format complete!"
