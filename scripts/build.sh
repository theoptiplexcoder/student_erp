#!/bin/bash

set -e

echo "Building all packages and applications..."
pnpm nx run-many --target=build --all
echo "Build complete!"
