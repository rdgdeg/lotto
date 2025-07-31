#!/usr/bin/env python3
"""
Script pour tester différentes configurations de connexion Supabase
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from supabase import create_client

# Configuration Supabase - Utiliser les variables d'environnement
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

def test_supabase_client():
    """Teste la connexion via le client Supabase"""
    print("🔍 Test du client Supabase...")
    
    try:
        # Créer le client Supabase
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Test simple
        print("✅ Client Supabase créé avec succès")
        
        # Essayer de récupérer des informations
        try:
            response = supabase.table('draws_euromillions').select('count', count='exact').execute()
            print(f"✅ Connexion réussie - Table draws_euromillions accessible")
        except Exception as e:
            print(f"⚠️ Table draws_euromillions non trouvée (normal si pas encore créée): {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur client Supabase : {e}")
        return False

def test_postgres_connection():
    """Teste la connexion PostgreSQL directe"""
    print("\n🔍 Test de connexion PostgreSQL...")
    
    # Différentes URLs à tester (utiliser les variables d'environnement)
    if not SUPABASE_URL:
        print("❌ SUPABASE_URL non configurée")
        return None
        
    # Extraire l'ID du projet depuis l'URL
    project_id = SUPABASE_URL.split('.')[0].split('//')[1]
    
    urls_to_test = [
        f"postgresql://postgres.{project_id}:password@db.{project_id}.supabase.co:5432/postgres",
        f"postgresql://postgres.{project_id}:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
        f"postgresql://postgres.{project_id}:{SUPABASE_SECRET_KEY}@db.{project_id}.supabase.co:5432/postgres",
        f"postgresql://postgres.{project_id}:{SUPABASE_SECRET_KEY}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
    ]
    
    for i, url in enumerate(urls_to_test, 1):
        print(f"\nTest {i}: {url[:50]}...")
        try:
            engine = create_engine(url)
            with engine.connect() as connection:
                result = connection.execute("SELECT version()")
                version = result.fetchone()[0]
                print(f"✅ Connexion réussie - Version: {version[:50]}...")
                return url
        except Exception as e:
            print(f"❌ Échec: {str(e)[:100]}...")
    
    return None

if __name__ == "__main__":
    print("🚀 Test de configuration Supabase")
    print("=" * 60)
    
    # Vérifier que les variables d'environnement sont configurées
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Variables d'environnement manquantes")
        print("💡 Créez un fichier .env avec vos clés Supabase")
        print("💡 Voir le fichier env.example pour la structure")
        exit(1)
    
    # Test 1: Client Supabase
    client_ok = test_supabase_client()
    
    # Test 2: Connexion PostgreSQL
    working_url = test_postgres_connection()
    
    print("\n" + "=" * 60)
    if client_ok and working_url:
        print("🎉 Configuration réussie !")
        print(f"URL PostgreSQL fonctionnelle : {working_url}")
    elif client_ok:
        print("⚠️ Client Supabase OK, mais connexion PostgreSQL échoue")
        print("💡 Utilisez le client Supabase pour les opérations")
    else:
        print("❌ Configuration échouée")
        print("💡 Vérifiez les credentials Supabase") 