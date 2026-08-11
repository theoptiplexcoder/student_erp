#!/bin/bash

set -e

echo "Cleaning build artifacts..."

rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf apps/*/.next
rm -rf apps/*/dist
rm -rf packages/*/dist
rm -rf coverage
rm -rf .nx

echo "Clean complete!"
