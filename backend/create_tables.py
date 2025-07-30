#!/usr/bin/env python3
"""
Script pour créer les tables dans Supabase
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from app.models import Base

def create_tables():
    """Crée toutes les tables définies dans les modèles"""
    try:
        print("🔄 Création des tables dans Supabase...")
        
        # Créer toutes les tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Tables créées avec succès !")
        print("\n📋 Tables créées :")
        print("- draws_euromillions")
        print("- draws_loto") 
        print("- stats")
        
        print("\n🎉 Base de données Supabase configurée et prête !")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables : {e}")
        print("\n💡 Vérifiez que :")
        print("1. Les credentials Supabase sont corrects")
        print("2. La base de données est accessible")
        print("3. Les permissions sont configurées")

if __name__ == "__main__":
    create_tables() 