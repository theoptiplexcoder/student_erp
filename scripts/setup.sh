#!/bin/bash

set -e

echo "Setting up Student ERP development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org/"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required. Install with: npm install -g pnpm"; exit 1; }

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Setup environment
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Setup git hooks
echo "Setting up git hooks..."
pnpm prepare

echo ""
echo "Setup complete!"
echo ""
echo "Get started:"
echo "  pnpm dev          # Start all applications"
echo "  pnpm build        # Build all packages"
echo "  pnpm lint         # Lint all code"
echo ""
