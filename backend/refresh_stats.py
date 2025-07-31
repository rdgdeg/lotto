#!/usr/bin/env python3
"""
Script pour forcer le rafraîchissement des statistiques et vider le cache
"""

import requests
import json
import time

def refresh_stats():
    """Force le rafraîchissement des statistiques"""
    print("🔄 Rafraîchissement des statistiques...")
    
    base_url = "http://localhost:8000"
    
    # Endpoints à rafraîchir
    endpoints = [
        "/api/loto/quick-stats",
        "/api/loto/years",
        "/api/loto/",
        "/api/loto/advanced/comprehensive-stats",
        "/api/euromillions/quick-stats",
        "/api/euromillions/years"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"  🔄 Rafraîchissement de {endpoint}...")
            response = requests.get(f"{base_url}{endpoint}?refresh={int(time.time())}")
            
            if response.status_code == 200:
                data = response.json()
                if endpoint == "/api/loto/quick-stats":
                    print(f"    ✅ Loto: {data.get('total_draws', 0)} tirages")
                elif endpoint == "/api/euromillions/quick-stats":
                    print(f"    ✅ Euromillions: {data.get('total_draws', 0)} tirages")
                else:
                    print(f"    ✅ OK")
            else:
                print(f"    ❌ Erreur: {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Erreur: {e}")
    
    print("\n🎉 Rafraîchissement terminé!")
    print("\n💡 Instructions pour le frontend:")
    print("1. Ouvrez http://localhost:3000")
    print("2. Allez sur la page Loto")
    print("3. Cliquez sur '📊 Statistiques Rapides'")
    print("4. Si les données ne s'affichent pas, utilisez le bouton '🔍 Diagnostic'")
    print("5. Puis cliquez sur '🗑️ Vider Cache + Recharger'")

if __name__ == "__main__":
    refresh_stats() 