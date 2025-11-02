#!/bin/bash
# VPS Deployment Script for PROXe React App

set -e

echo "Starting deployment..."

# Build the frontend
cd frontend
echo "Building Next.js app..."
npm install
npm run build

# Build backend (if needed)
cd ../backend
echo "Installing backend dependencies..."
npm install

echo "Deployment preparation complete!"
echo "Next steps:"
echo "1. Copy the .next/standalone folder to your VPS"
echo "2. Copy the backend folder to your VPS"
echo "3. Set up PM2 or systemd to run the backend server"
echo "4. Configure nginx to serve the Next.js app"

