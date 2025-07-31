#!/usr/bin/env python3
"""
Script pour tester différentes configurations de connexion Supabase
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from supabase import create_client

# Configuration Supabase
SUPABASE_URL = "https://njmwuyirykeywdiwcgtv.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbXd1eWlyeWtleXdkaXdjZ3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODU2MjcsImV4cCI6MjA2OTM2MTYyN30.XEKenw1qwdWC_Guj5dWcfn0OT2pZfrZIQu_gg41bnek"
SUPABASE_SECRET_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbXd1eWlyeWtleXdkaXdjZ3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NTYyNywiZXhwIjoyMDY5MzYxNjI3fQ.IA3K80b_Ozff3_yHcNHXXC8fM8XnNKVEw4A4lbUjekI"

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
    
    # Différentes URLs à tester
    urls_to_test = [
        "postgresql://postgres.njmwuyirykeywdiwcgtv:password@db.njmwuyirykeywdiwcgtv.supabase.co:5432/postgres",
        "postgresql://postgres.njmwuyirykeywdiwcgtv:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
        f"postgresql://postgres.njmwuyirykeywdiwcgtv:{SUPABASE_SECRET_KEY}@db.njmwuyirykeywdiwcgtv.supabase.co:5432/postgres",
        f"postgresql://postgres.njmwuyirykeywdiwcgtv:{SUPABASE_SECRET_KEY}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
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