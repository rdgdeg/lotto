#!/bin/bash

echo "🛑 ARRÊT DES SERVICES"
echo "====================="

# Arrêter Redis
echo "📦 Arrêt de Redis..."
redis-cli shutdown

# Arrêter Celery Worker
echo "🔧 Arrêt du Celery Worker..."
pkill -f "celery.*worker"

# Arrêter Celery Beat
echo "⏰ Arrêt de Celery Beat..."
pkill -f "celery.*beat"

echo ""
echo "✅ TOUS LES SERVICES ARRÊTÉS"
echo "============================" 