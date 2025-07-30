#!/usr/bin/env python3
"""
Script pour vérifier l'intégrité des données et afficher un résumé complet.
"""

import sqlite3
import requests
from datetime import datetime

def verify_data_integrity():
    """Vérifie l'intégrité des données et affiche un résumé complet"""
    
    print("🔍 VÉRIFICATION DE L'INTÉGRITÉ DES DONNÉES")
    print("=" * 60)
    
    # 1. Vérification directe de la base de données
    print("\n📊 VÉRIFICATION DIRECTE DE LA BASE DE DONNÉES:")
    print("-" * 40)
    
    conn = sqlite3.connect('./lotto.db')
    cursor = conn.cursor()
    
    try:
        # Compter les tirages Euromillions
        cursor.execute("SELECT COUNT(*) FROM draws_euromillions")
        euromillions_count = cursor.fetchone()[0]
        
        # Compter les tirages Loto
        cursor.execute("SELECT COUNT(*) FROM draws_loto")
        loto_count = cursor.fetchone()[0]
        
        print(f"🎰 Euromillions: {euromillions_count} tirages")
        print(f"🍀 Loto: {loto_count} tirages")
        
        # Vérifier les années disponibles
        cursor.execute("SELECT DISTINCT strftime('%Y', date) as year FROM draws_euromillions ORDER BY year DESC")
        euromillions_years = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("SELECT DISTINCT strftime('%Y', date) as year FROM draws_loto ORDER BY year DESC")
        loto_years = [row[0] for row in cursor.fetchall()]
        
        print(f"📅 Années Euromillions: {', '.join(euromillions_years)}")
        print(f"📅 Années Loto: {', '.join(loto_years)}")
        
        # Vérifier les derniers tirages
        cursor.execute("SELECT date, n1, n2, n3, n4, n5, e1, e2 FROM draws_euromillions ORDER BY date DESC LIMIT 5")
        last_euromillions = cursor.fetchall()
        
        print(f"\n📅 Derniers tirages Euromillions:")
        for draw in last_euromillions:
            print(f"  - {draw[0]}: Numéros {draw[1:6]} - Étoiles {draw[6:8]}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification de la base: {e}")
    finally:
        conn.close()
    
    # 2. Vérification via l'API
    print("\n🌐 VÉRIFICATION VIA L'API:")
    print("-" * 40)
    
    try:
        # Test API Summary
        response = requests.get("http://localhost:8000/api/history/summary")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Summary - Euromillions: {data['euromillions']['total_draws']} tirages")
            print(f"✅ API Summary - Loto: {data['loto']['total_draws']} tirages")
        else:
            print(f"❌ Erreur API Summary: {response.status_code}")
            
        # Test API History avec différentes limites
        for limit in [100, 1000]:
            response = requests.get(f"http://localhost:8000/api/history/euromillions?limit={limit}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API History (limit={limit}) - Total: {data['total_draws']}, Retournés: {data.get('draws_returned', len(data['draws']))}")
            else:
                print(f"❌ Erreur API History (limit={limit}): {response.status_code}")
                
    except Exception as e:
        print(f"❌ Erreur lors de la vérification API: {e}")
    
    # 3. Comparaison et conclusion
    print("\n🔍 COMPARAISON ET CONCLUSION:")
    print("-" * 40)
    
    if euromillions_count == data['euromillions']['total_draws']:
        print("✅ COHÉRENCE: Les données de la base et de l'API correspondent")
    else:
        print("❌ INCOHÉRENCE: Les données de la base et de l'API ne correspondent pas")
    
    print(f"\n📋 RÉSUMÉ FINAL:")
    print(f"   • Base de données: {euromillions_count} tirages Euromillions")
    print(f"   • API Summary: {data['euromillions']['total_draws']} tirages Euromillions")
    print(f"   • Limite API History: 1000 tirages maximum")
    print(f"   • Tirages manquants: {euromillions_count - 1000} (si > 1000)")
    
    if euromillions_count > 1000:
        print(f"\n⚠️ ATTENTION: L'interface ne peut afficher que 1000 tirages maximum")
        print(f"   Les {euromillions_count - 1000} tirages les plus anciens ne sont pas visibles")
        print(f"   Solution: Utilisez les filtres par année pour voir tous les tirages")

if __name__ == "__main__":
    verify_data_integrity() 