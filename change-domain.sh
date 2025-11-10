#!/bin/bash

echo "🔍 Checking for hardcoded URLs..."
echo ""

cd /var/www/MERN-Stack-Project

echo "Searching for old IP address (134.199.193.253):"
grep -r "134.199.193.253" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null

echo ""
echo "Searching for localhost:5100:"
grep -r "localhost:5100" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null

echo ""
echo "Searching for localhost:5101:"
grep -r "localhost:5101" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null

echo ""
echo "✅ Check complete!"
echo ""
echo "Current backend env:"
cat backend/.env | grep -E "FRONTEND_URL|CORS_ORIGIN"
echo ""
echo "Current frontend env:"
cat frontend/.env | grep VITE_API_URL
echo ""
echo "Current Nginx config:"
cat /etc/nginx/sites-available/parkreviews | grep server_name
