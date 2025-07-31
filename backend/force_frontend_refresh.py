#!/usr/bin/env python3
"""
Script pour forcer le rafraîchissement complet du frontend
"""

import requests
import time

def force_frontend_refresh():
    """Force le rafraîchissement complet du frontend"""
    print("🔄 Forçage du rafraîchissement complet...")
    
    base_url = "http://localhost:8000"
    
    # Vider le cache en appelant tous les endpoints avec un timestamp
    timestamp = int(time.time())
    
    endpoints = [
        "/api/loto/quick-stats",
        "/api/loto/years",
        "/api/loto/",
        "/api/loto/advanced/comprehensive-stats"
    ]
    
    print("📊 Vérification des données backend:")
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}?_t={timestamp}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if endpoint == "/api/loto/quick-stats":
                    print(f"  ✅ {endpoint}: {data.get('total_draws', 0)} tirages")
                elif endpoint == "/api/loto/years":
                    years = data.get('years', [])
                    print(f"  ✅ {endpoint}: {len(years)} années ({min(years)}-{max(years)})")
                else:
                    print(f"  ✅ {endpoint}: OK")
            else:
                print(f"  ❌ {endpoint}: Erreur {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {endpoint}: {e}")
    
    print(f"\n🎯 Instructions pour résoudre le problème:")
    print(f"1. Ouvrez votre navigateur sur http://localhost:3000")
    print(f"2. Allez sur la page Loto")
    print(f"3. Cliquez sur le bouton '🔍 Diagnostic'")
    print(f"4. Cliquez sur '🗑️ Vider Cache + Recharger'")
    print(f"5. Ou faites Ctrl+F5 (Cmd+Shift+R sur Mac) pour forcer le rechargement")
    print(f"6. Ou ouvrez les outils de développement (F12) → Network → cochez 'Disable cache'")
    
    print(f"\n💡 Si le problème persiste:")
    print(f"• Vérifiez que le frontend tourne sur http://localhost:3000")
    print(f"• Vérifiez que le backend tourne sur http://localhost:8000")
    print(f"• Videz complètement le cache du navigateur")
    print(f"• Redémarrez le navigateur")

if __name__ == "__main__":
    force_frontend_refresh() 