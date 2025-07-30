#!/bin/bash

echo "🚀 DÉMARRAGE DES SERVICES - PHASE 1 OPTIMISATIONS"
echo "=================================================="

# Vérifier si Redis est installé
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis n'est pas installé. Installation..."
    
    # Installation de Redis sur macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install redis
        else
            echo "❌ Homebrew n'est pas installé. Veuillez installer Redis manuellement."
            exit 1
        fi
    else
        echo "❌ Veuillez installer Redis manuellement pour votre système."
        exit 1
    fi
fi

# Démarrer Redis
echo "📦 Démarrage de Redis..."
redis-server --daemonize yes --port 6379
sleep 2

# Vérifier que Redis fonctionne
if redis-cli ping &> /dev/null; then
    echo "✅ Redis démarré avec succès"
else
    echo "❌ Erreur lors du démarrage de Redis"
    exit 1
fi

# Activer l'environnement virtuel
echo "🐍 Activation de l'environnement virtuel..."
source venv/bin/activate

# Démarrer Celery Worker
echo "🔧 Démarrage du Celery Worker..."
celery -A app.celery_app worker --loglevel=info --detach

# Démarrer Celery Beat (pour les tâches périodiques)
echo "⏰ Démarrage de Celery Beat..."
celery -A app.celery_app beat --loglevel=info --detach

echo ""
echo "✅ TOUS LES SERVICES DÉMARRÉS"
echo "=============================="
echo "📦 Redis: localhost:6379"
echo "🔧 Celery Worker: En cours d'exécution"
echo "⏰ Celery Beat: En cours d'exécution"
echo ""
echo "🎯 Pour tester les optimisations:"
echo "   python3 test_optimizations.py"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   ./stop_services.sh" 