#!/bin/bash

# SSL 인증서 설정 스크립트
# EC2에서 실행: sudo bash scripts/ssl-setup.sh

set -e

echo "🔒 Starting SSL certificate setup..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 변수
DOMAIN="byeoung.dev"
SUBDOMAINS="www.byeoung.dev resume.byeoung.dev"
APP_DIR="/home/ubuntu/blog/apps/blog"
SSL_DIR="$APP_DIR/nginx/ssl"

# SSL 디렉토리 생성
echo -e "${YELLOW}📁 Creating SSL directory...${NC}"
mkdir -p $SSL_DIR

# Certbot 설치 확인
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}❌ Certbot is not installed!${NC}"
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt update
    apt install -y certbot
fi

# 기존 컨테이너 중지 (80 포트 사용을 위해)
echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
cd $APP_DIR
docker-compose down || true

# SSL 인증서 발급
echo -e "${YELLOW}🔒 Generating SSL certificate...${NC}"
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d resume.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email qudcks4885@naver.com \
    --preferred-challenges http

# 인증서 확인
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ SSL certificate generation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SSL certificate generated successfully!${NC}"

# 인증서 복사
echo -e "${YELLOW}📋 Copying SSL certificates...${NC}"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/

# 권한 설정
chown -R ubuntu:ubuntu $SSL_DIR
chmod 644 $SSL_DIR/*.pem

echo -e "${GREEN}✅ SSL certificates copied to $SSL_DIR${NC}"

# 자동 갱신 설정
echo -e "${YELLOW}⏰ Setting up automatic renewal...${NC}"

# Cron 작업 생성
CRON_JOB="0 3 1 * * certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/ && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/ && cd $APP_DIR && docker-compose restart nginx'"

# 기존 cron 작업 확인
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Automatic renewal configured!${NC}"
else
    echo -e "${YELLOW}⚠️  Automatic renewal is already configured!${NC}"
fi

# 인증서 정보 출력
echo -e "${YELLOW}📊 Certificate information:${NC}"
certbot certificates

# 컨테이너 재시작
echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
cd /home/ubuntu/blog
docker-compose up -d

echo -e "${GREEN}✨ SSL setup completed successfully!${NC}"
echo -e "${YELLOW}📝 Certificate locations:${NC}"
echo -e "  - Fullchain: $SSL_DIR/fullchain.pem"
echo -e "  - Private Key: $SSL_DIR/privkey.pem"
echo -e "${YELLOW}🔄 Auto-renewal: Configured (runs monthly on 1st at 3 AM)${NC}"
echo -e "${YELLOW}🔍 Test renewal: sudo certbot renew --dry-run${NC}"
