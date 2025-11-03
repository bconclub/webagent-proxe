#!/bin/bash
# Build script for brand-specific packages

BRAND=$1
if [ -z "$BRAND" ]; then
  echo "Usage: ./build-brand.sh [proxe|windchasers]"
  exit 1
fi

echo "Building $BRAND widget..."

# Set environment variable for brand
export NEXT_PUBLIC_BRAND=$BRAND

# Build Next.js app
npm run build

# Create output directory
OUTPUT_DIR="dist/$BRAND-widget"
mkdir -p $OUTPUT_DIR

# Copy build output
cp -r .next/standalone/* $OUTPUT_DIR/ 2>/dev/null || cp -r .next/static $OUTPUT_DIR/static
cp -r .next/BUILD_ID $OUTPUT_DIR/BUILD_ID 2>/dev/null || true

echo "Build complete: $OUTPUT_DIR"

