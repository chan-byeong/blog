#!/bin/bash

# 헬스체크 스크립트
# 사용법: ./scripts/health-check.sh

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Starting health check..."

# 도메인 목록
DOMAINS=("https://byeoung.dev" "https://www.byeoung.dev" "https://resume.byeoung.dev")

# 각 도메인 체크
for DOMAIN in "${DOMAINS[@]}"; do
    echo -e "${YELLOW}🔍 Checking $DOMAIN...${NC}"

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN || echo "000")

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
        echo -e "${GREEN}✅ $DOMAIN is healthy (Status: $RESPONSE)${NC}"
    else
        echo -e "${RED}❌ $DOMAIN is down (Status: $RESPONSE)${NC}"
        exit 1
    fi
done

# Docker 컨테이너 상태 확인
echo -e "${YELLOW}🐳 Checking Docker containers...${NC}"

NEXTJS_STATUS=$(docker inspect -f '{{.State.Health.Status}}' blog-nextjs 2>/dev/null || echo "not found")
NGINX_STATUS=$(docker inspect -f '{{.State.Health.Status}}' blog-nginx 2>/dev/null || echo "not found")

if [ "$NEXTJS_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Next.js container is healthy${NC}"
else
    echo -e "${RED}❌ Next.js container status: $NEXTJS_STATUS${NC}"
    exit 1
fi

if [ "$NGINX_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Nginx container is healthy${NC}"
else
    echo -e "${RED}❌ Nginx container status: $NGINX_STATUS${NC}"
    exit 1
fi

# 디스크 사용량 체크
echo -e "${YELLOW}💾 Checking disk usage...${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Disk usage: ${DISK_USAGE}% (Warning)${NC}"
else
    echo -e "${RED}❌ Disk usage: ${DISK_USAGE}% (Critical)${NC}"
fi

# 메모리 사용량 체크
echo -e "${YELLOW}🧠 Checking memory usage...${NC}"
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')

if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ Memory usage: ${MEMORY_USAGE}%${NC}"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Memory usage: ${MEMORY_USAGE}% (Warning)${NC}"
else
    echo -e "${RED}❌ Memory usage: ${MEMORY_USAGE}% (Critical)${NC}"
fi

# SSL 인증서 만료일 체크
echo -e "${YELLOW}🔒 Checking SSL certificate expiry...${NC}"
EXPIRY_DATE=$(echo | openssl s_client -servername byeoung.dev -connect byeoung.dev:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ "$DAYS_UNTIL_EXPIRY" -gt 30 ]; then
    echo -e "${GREEN}✅ SSL certificate expires in $DAYS_UNTIL_EXPIRY days${NC}"
elif [ "$DAYS_UNTIL_EXPIRY" -gt 7 ]; then
    echo -e "${YELLOW}⚠️  SSL certificate expires in $DAYS_UNTIL_EXPIRY days (Warning)${NC}"
else
    echo -e "${RED}❌ SSL certificate expires in $DAYS_UNTIL_EXPIRY days (Critical)${NC}"
fi

echo -e "${GREEN}✨ Health check completed!${NC}"
