#!/bin/bash

# EC2 배포 스크립트
# 사용법: ./scripts/deploy.sh

set -e

echo "🚀 Starting deployment to EC2..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 변수 설정
APP_DIR="/home/ubuntu/blog"

echo -e "${YELLOW}📂 Navigating to application directory...${NC}"
cd $APP_DIR || exit 1

echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with Grafana Cloud credentials${NC}"
    exit 1
fi

# Grafana Cloud 환경 변수 확인
if ! grep -q "GRAFANA_CLOUD_LOKI_URL" .env; then
    echo -e "${YELLOW}⚠️  Warning: GRAFANA_CLOUD_LOKI_URL not found in .env${NC}"
    echo -e "${YELLOW}Promtail will not send logs to Grafana Cloud${NC}"
fi

echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git fetch origin
git pull origin main

echo -e "${YELLOW}🐳 Stopping existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}🔨 Building new Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚢 Starting containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for containers to be healthy...${NC}"
sleep 10

# 헬스체크
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose ps | grep -q "healthy"; then
        echo -e "${GREEN}✅ Containers are healthy!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for containers to be healthy... ($((RETRY_COUNT + 1))/$MAX_RETRIES)${NC}"
        sleep 5
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Containers failed to become healthy!${NC}"
    docker-compose logs
    exit 1
fi

echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -af --filter "until=24h"

echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose ps

echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=30

# Promtail 상태 확인
if docker-compose ps | grep -q "blog-promtail"; then
    echo -e "${GREEN}✅ Promtail is running${NC}"
    
    # Promtail metrics 확인
    if curl -s http://localhost:9080/metrics > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Promtail metrics endpoint is accessible${NC}"
        
        # 전송된 로그 수 확인
        SENT_LOGS=$(curl -s http://localhost:9080/metrics | grep "promtail_sent_entries_total" | tail -1 | awk '{print $2}')
        if [ ! -z "$SENT_LOGS" ]; then
            echo -e "${GREEN}📊 Total logs sent to Grafana Cloud: ${SENT_LOGS}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Promtail metrics endpoint not accessible${NC}"
    fi
    
    # Promtail 에러 로그 확인
    ERROR_COUNT=$(docker logs blog-promtail 2>&1 | grep -i "error" | wc -l)
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Promtail has $ERROR_COUNT error messages${NC}"
        echo -e "${YELLOW}Check logs: docker logs blog-promtail${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Promtail container not found${NC}"
fi

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Visit: https://byeoung.dev${NC}"
echo -e "${GREEN}📊 Grafana Cloud: https://grafana.com/orgs/your-org${NC}"
