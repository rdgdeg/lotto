#!/usr/bin/env python3
"""
Script pour créer les tables dans Supabase via l'API
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import supabase

def create_tables_supabase():
    """Crée les tables dans Supabase via l'API"""
    print("🔄 Création des tables dans Supabase...")
    
    # Définitions des tables
    tables = {
        'draws_euromillions': {
            'columns': [
                {'name': 'id', 'type': 'serial', 'primary_key': True},
                {'name': 'date', 'type': 'date', 'not_null': True},
                {'name': 'n1', 'type': 'integer', 'not_null': True},
                {'name': 'n2', 'type': 'integer', 'not_null': True},
                {'name': 'n3', 'type': 'integer', 'not_null': True},
                {'name': 'n4', 'type': 'integer', 'not_null': True},
                {'name': 'n5', 'type': 'integer', 'not_null': True},
                {'name': 'e1', 'type': 'integer', 'not_null': True},
                {'name': 'e2', 'type': 'integer', 'not_null': True}
            ]
        },
        'draws_loto': {
            'columns': [
                {'name': 'id', 'type': 'serial', 'primary_key': True},
                {'name': 'date', 'type': 'date', 'not_null': True},
                {'name': 'n1', 'type': 'integer', 'not_null': True},
                {'name': 'n2', 'type': 'integer', 'not_null': True},
                {'name': 'n3', 'type': 'integer', 'not_null': True},
                {'name': 'n4', 'type': 'integer', 'not_null': True},
                {'name': 'n5', 'type': 'integer', 'not_null': True},
                {'name': 'n6', 'type': 'integer', 'not_null': True},
                {'name': 'complementaire', 'type': 'integer', 'not_null': True}
            ]
        },
        'stats': {
            'columns': [
                {'name': 'id', 'type': 'serial', 'primary_key': True},
                {'name': 'jeu', 'type': 'text', 'not_null': True},
                {'name': 'numero', 'type': 'integer', 'not_null': True},
                {'name': 'type', 'type': 'text', 'not_null': True},
                {'name': 'frequence', 'type': 'float', 'not_null': True},
                {'name': 'periode', 'type': 'text'}
            ]
        }
    }
    
    created_tables = []
    
    for table_name, table_def in tables.items():
        try:
            print(f"📋 Création de la table {table_name}...")
            
            # Vérifier si la table existe déjà
            try:
                response = supabase.table(table_name).select('count', count='exact').execute()
                print(f"✅ Table {table_name} existe déjà")
                created_tables.append(table_name)
                continue
            except:
                pass
            
            # Créer la table (via SQL direct si possible)
            # Note: Supabase ne permet pas de créer des tables via l'API REST
            # Les tables doivent être créées via l'interface web ou SQL
            print(f"⚠️ Table {table_name} doit être créée manuellement via l'interface Supabase")
            
        except Exception as e:
            print(f"❌ Erreur lors de la création de {table_name}: {e}")
    
    print(f"\n📊 Tables vérifiées : {', '.join(created_tables)}")
    
    if len(created_tables) == len(tables):
        print("🎉 Toutes les tables sont prêtes !")
    else:
        print("\n💡 Pour créer les tables manquantes :")
        print("1. Allez sur votre dashboard Supabase")
        print("2. Cliquez sur 'SQL Editor'")
        print("3. Exécutez les requêtes SQL suivantes :")
        
        for table_name, table_def in tables.items():
            if table_name not in created_tables:
                print(f"\n-- Table {table_name}")
                columns = []
                for col in table_def['columns']:
                    col_def = f"{col['name']} {col['type']}"
                    if col.get('primary_key'):
                        col_def += " PRIMARY KEY"
                    if col.get('not_null'):
                        col_def += " NOT NULL"
                    columns.append(col_def)
                
                sql = f"CREATE TABLE {table_name} (\n  " + ",\n  ".join(columns) + "\n);"
                print(sql)

if __name__ == "__main__":
    create_tables_supabase() 