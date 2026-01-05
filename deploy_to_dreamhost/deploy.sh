#!/bin/bash

# VeriShelf Deployment Script
# This script prepares all files for deployment to DreamHost

set -e

echo "🚀 VeriShelf Deployment Preparation"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy_to_dreamhost"
BUILD_DIR="$PROJECT_ROOT/dist"
DEPLOYMENT_PACKAGE="$HOME/verishelf_deployment_$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}Project root: $PROJECT_ROOT${NC}"
echo -e "${YELLOW}Deployment package: $DEPLOYMENT_PACKAGE${NC}"
echo ""

# Step 1: Build React App
echo "📦 Step 1: Building React application..."
cd "$PROJECT_ROOT"
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the right directory?"
    exit 1
fi

npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build failed. dist/ directory not found."
    exit 1
fi

echo -e "${GREEN}✅ React app built successfully${NC}"
echo ""

# Step 2: Create deployment directory
echo "📁 Step 2: Creating deployment structure..."
mkdir -p "$DEPLOYMENT_PACKAGE"
mkdir -p "$DEPLOYMENT_PACKAGE/app"
mkdir -p "$DEPLOYMENT_PACKAGE/server"

# Step 3: Copy landing page files
echo "📄 Step 3: Copying landing page files..."
cp "$DEPLOY_DIR/website/index.html" "$DEPLOYMENT_PACKAGE/"
cp "$DEPLOY_DIR/website/main.js" "$DEPLOYMENT_PACKAGE/"
cp "$DEPLOY_DIR/website/style.css" "$DEPLOYMENT_PACKAGE/"
if [ -f "$DEPLOY_DIR/website/stripe-config.js" ]; then
    cp "$DEPLOY_DIR/website/stripe-config.js" "$DEPLOYMENT_PACKAGE/"
fi
if [ -d "$DEPLOY_DIR/website" ] && [ -n "$(find "$DEPLOY_DIR/website" -name "*.jpeg" -o -name "*.jpg" -o -name "*.png" 2>/dev/null)" ]; then
    cp "$DEPLOY_DIR/website"/*.{jpeg,jpg,png} "$DEPLOYMENT_PACKAGE/" 2>/dev/null || true
fi

# Step 4: Copy React app
echo "⚛️  Step 4: Copying React application..."
cp -r "$BUILD_DIR"/* "$DEPLOYMENT_PACKAGE/app/"

# Step 5: Copy server files
echo "🔧 Step 5: Copying server files..."
cp "$DEPLOY_DIR/server/server.js" "$DEPLOYMENT_PACKAGE/server/"
cp "$DEPLOY_DIR/server/package.json" "$DEPLOYMENT_PACKAGE/server/"
cp "$DEPLOY_DIR/server/setup-stripe-products.js" "$DEPLOYMENT_PACKAGE/server/" 2>/dev/null || true

# Copy .env if it exists (but warn about security)
if [ -f "$DEPLOY_DIR/server/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file found. Make sure to upload it securely.${NC}"
    cp "$DEPLOY_DIR/server/.env" "$DEPLOYMENT_PACKAGE/server/"
else
    echo -e "${YELLOW}⚠️  Warning: .env file not found. You'll need to create it on the server.${NC}"
fi

# Step 6: Copy .htaccess
echo "📝 Step 6: Copying .htaccess..."
if [ -f "$DEPLOY_DIR/.htaccess" ]; then
    cp "$DEPLOY_DIR/.htaccess" "$DEPLOYMENT_PACKAGE/"
else
    echo -e "${YELLOW}⚠️  Warning: .htaccess not found. Creating default one...${NC}"
    cat > "$DEPLOYMENT_PACKAGE/.htaccess" << 'EOF'
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Serve React app from /app directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/app
RewriteRule ^app/(.*)$ /app/index.html [L]

# Don't rewrite if file exists
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Default: serve landing page
RewriteRule ^$ index.html [L]
EOF
fi

# Step 7: Create deployment info file
echo "📋 Step 7: Creating deployment info..."
cat > "$DEPLOYMENT_PACKAGE/DEPLOY_INFO.txt" << EOF
VeriShelf Deployment Package
Created: $(date)
Version: $(git describe --tags 2>/dev/null || echo "unknown")

Directory Structure:
- index.html, main.js, style.css (landing page - root)
- app/ (React dashboard application)
- server/ (Node.js backend API)
- .htaccess (Apache configuration)

Upload Instructions:
1. Upload all files maintaining this structure
2. Root files go to: /home/username/verishelf.com/
3. App files go to: /home/username/verishelf.com/app/
4. Server files go to: /home/username/verishelf.com/server/
5. Set up Node.js app in DreamHost panel pointing to /server
6. Install dependencies: cd server && npm install --production
7. Enable HTTPS in DreamHost panel

See DEPLOYMENT_COMPLETE.md for detailed instructions.
EOF

echo ""
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo "📦 Package location: $DEPLOYMENT_PACKAGE"
echo ""
echo "📋 Next steps:"
echo "1. Review the files in: $DEPLOYMENT_PACKAGE"
echo "2. Upload to DreamHost following DEPLOYMENT_COMPLETE.md"
echo "3. Or use: scp -r $DEPLOYMENT_PACKAGE/* username@verishelf.com:/home/username/verishelf.com/"
echo ""
echo "⚠️  Remember to:"
echo "   - Upload .env file securely (use SFTP, not FTP)"
echo "   - Set correct file permissions on server"
echo "   - Install npm dependencies on server"
echo "   - Enable HTTPS in DreamHost panel"
echo ""

