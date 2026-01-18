#!/bin/bash

# EC2 초기 설정 스크립트
# EC2 인스턴스에서 실행: sudo bash setup-ec2.sh

set -e

echo "🚀 Starting EC2 initial setup..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 시스템 업데이트
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# 필수 패키지 설치
echo -e "${YELLOW}📦 Installing essential packages...${NC}"
apt install -y \
    curl \
    wget \
    git \
    htop \
    vim \
    ufw \
    certbot \
    python3-certbot-nginx

# Docker 설치
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed successfully!${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed!${NC}"
fi

# Docker Compose 설치
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is already installed!${NC}"
fi

# ubuntu 사용자를 docker 그룹에 추가
echo -e "${YELLOW}👤 Adding ubuntu user to docker group...${NC}"
usermod -aG docker ubuntu

# 방화벽 설정
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw status

# 스왑 파일 생성 (4GB)
echo -e "${YELLOW}💾 Creating swap file...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo -e "${GREEN}✅ Swap file created!${NC}"
else
    echo -e "${GREEN}✅ Swap file already exists!${NC}"
fi

# 애플리케이션 디렉토리 생성
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p /home/ubuntu/blog
chown -R ubuntu:ubuntu /home/ubuntu/blog

# Git 설정
echo -e "${YELLOW}🔧 Configuring Git...${NC}"
sudo -u ubuntu git config --global user.name "EC2 Deploy"
sudo -u ubuntu git config --global user.email "deploy@byeoung.dev"

# 로그 디렉토리 생성
echo -e "${YELLOW}📁 Creating log directories...${NC}"
mkdir -p /home/ubuntu/blog/apps/blog/nginx/logs
mkdir -p /home/ubuntu/blog/apps/blog/nginx/ssl
chown -R ubuntu:ubuntu /home/ubuntu/blog

# Docker 서비스 시작
echo -e "${YELLOW}🐳 Starting Docker service...${NC}"
systemctl enable docker
systemctl start docker

# 버전 확인
echo -e "${YELLOW}📊 Installed versions:${NC}"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Git: $(git --version)"
echo "Certbot: $(certbot --version)"

echo -e "${GREEN}✨ EC2 setup completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Exit and re-login to apply docker group changes"
echo -e "2. Clone your repository: git clone https://github.com/your-username/blog.git /home/ubuntu/blog"
echo -e "3. Generate SSL certificate: sudo certbot certonly --standalone -d byeoung.dev -d www.byeoung.dev -d resume.byeoung.dev"
echo -e "4. Copy SSL certificates to nginx/ssl directory"
echo -e "5. Run deployment: cd /home/ubuntu/blog/apps/blog && docker-compose up -d"
