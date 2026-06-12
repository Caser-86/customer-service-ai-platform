#!/bin/bash

# SSL 证书生成脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSL_DIR="$SCRIPT_DIR/../nginx/ssl"

echo "=== SSL 证书生成 ==="

# 创建 SSL 目录
mkdir -p "$SSL_DIR"

# 检查是否已有证书
if [ -f "$SSL_DIR/fullchain.pem" ] && [ -f "$SSL_DIR/privkey.pem" ]; then
    echo "SSL 证书已存在"
    echo "如需重新生成，请先删除 $SSL_DIR 目录中的证书文件"
    exit 0
fi

# 生成自签名证书（用于开发/测试）
echo "生成自签名证书..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/privkey.pem" \
    -out "$SSL_DIR/fullchain.pem" \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=CustomerService/CN=localhost"

echo "✓ SSL 证书生成完成"
echo "证书位置: $SSL_DIR"
echo "  - fullchain.pem (证书)"
echo "  - privkey.pem (私钥)"
echo ""
echo "注意: 这是自签名证书，仅用于开发/测试"
echo "生产环境请使用 Let's Encrypt 或其他受信任的证书"
echo ""
echo "Let's Encrypt 证书获取命令:"
echo "  sudo certbot certonly --standalone -d your-domain.com"
echo "  sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem $SSL_DIR/"
echo "  sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem $SSL_DIR/"
