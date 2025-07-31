#!/usr/bin/env python3
"""
Script de test pour vérifier la connexion frontend-backend
"""

import requests
import json
from datetime import datetime

def test_api_endpoints():
    """Teste tous les endpoints principaux"""
    base_url = "http://localhost:8000/api"
    
    print("🔍 Test de connexion Frontend-Backend")
    print("=" * 50)
    
    # Test de santé de l'API
    try:
        response = requests.get(f"{base_url}/loto/", timeout=5)
        if response.status_code == 200:
            print("✅ API Backend accessible")
        else:
            print(f"❌ API Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Backend inaccessible: {e}")
        return False
    
    # Test des endpoints Loto
    print("\n📊 Test des endpoints Loto:")
    loto_endpoints = [
        "/loto/quick-stats",
        "/loto/years", 
        "/loto/advanced/comprehensive-stats",
        "/loto/advanced/hot-cold-analysis",
        "/loto/advanced/patterns"
    ]
    
    for endpoint in loto_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "total_draws" in data:
                    print(f"✅ {endpoint}: {data['total_draws']} tirages")
                else:
                    print(f"✅ {endpoint}: OK")
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    # Test des endpoints Euromillions
    print("\n🇪🇺 Test des endpoints Euromillions:")
    euromillions_endpoints = [
        "/euromillions/quick-stats",
        "/euromillions/years",
        "/euromillions/advanced/comprehensive-stats"
    ]
    
    for endpoint in euromillions_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "total_draws" in data:
                    print(f"✅ {endpoint}: {data['total_draws']} tirages")
                else:
                    print(f"✅ {endpoint}: OK")
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    # Test du frontend
    print("\n🌐 Test du Frontend:")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend accessible")
        else:
            print(f"❌ Frontend erreur: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend inaccessible: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Instructions pour résoudre les problèmes:")
    print("1. Si l'API n'est pas accessible, vérifiez que le backend tourne sur le port 8000")
    print("2. Si le frontend n'est pas accessible, vérifiez qu'il tourne sur le port 3000")
    print("3. Si les endpoints retournent des erreurs, vérifiez les logs du backend")
    print("4. Utilisez le bouton '🔍 Diagnostic' dans l'interface pour plus de détails")
    
    return True

if __name__ == "__main__":
    test_api_endpoints() 