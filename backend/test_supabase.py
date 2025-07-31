#!/usr/bin/env python3
"""
Script de test pour vérifier la connexion à Supabase
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Base

def test_supabase_connection():
    """Teste la connexion à Supabase"""
    print("🔍 Test de connexion à Supabase...")
    
    # Test 1: Connexion SQLAlchemy
    try:
        with engine.connect() as connection:
            print("✅ Connexion SQLAlchemy réussie")
            
            # Test de requête simple
            result = connection.execute("SELECT version()")
            version = result.fetchone()[0]
            print(f"📊 Version PostgreSQL : {version}")
            
    except Exception as e:
        print(f"❌ Erreur de connexion SQLAlchemy : {e}")
        return False
    
    print("\n🎉 Test de connexion réussi !")
    return True

def create_tables_if_needed():
    """Crée les tables si elles n'existent pas"""
    print("\n🔧 Création des tables si nécessaire...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables créées/vérifiées avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables : {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test de configuration Supabase")
    print("=" * 50)
    
    # Test de connexion
    if test_supabase_connection():
        # Créer les tables si nécessaire
        create_tables_if_needed()
        
        print("\n" + "=" * 50)
        print("🎉 Configuration Supabase terminée avec succès !")
        print("\n💡 Prochaines étapes :")
        print("1. Lancer le serveur : uvicorn app.main:app --reload")
        print("2. Importer des données via l'interface web")
        print("3. Générer des grilles optimisées")
    else:
        print("\n❌ Échec de la configuration Supabase")
        print("\n💡 Vérifiez :")
        print("1. Les credentials Supabase")
        print("2. La connectivité réseau")
        print("3. Les permissions de la base de données") 