#!/usr/bin/env python3
"""
Script pour tester la connectivité entre frontend et backend
"""

import requests
import json
import time

def test_connection():
    """Teste la connectivité entre frontend et backend"""
    print("🔍 Test de connectivité Frontend ↔ Backend")
    print("=" * 50)
    
    # Test 1: Backend directement
    print("\n1️⃣ Test du backend (localhost:8000):")
    try:
        response = requests.get("http://localhost:8000/api/loto/quick-stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Backend accessible: {data.get('total_draws', 0)} tirages")
        else:
            print(f"  ❌ Backend erreur: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Backend inaccessible: {e}")
        return
    
    # Test 2: Frontend directement
    print("\n2️⃣ Test du frontend (localhost:3000):")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("  ✅ Frontend accessible")
        else:
            print(f"  ❌ Frontend erreur: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Frontend inaccessible: {e}")
    
    # Test 3: Simulation d'appel depuis le frontend
    print("\n3️⃣ Test d'appel API depuis le frontend:")
    try:
        # Simuler un appel avec les headers du navigateur
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
        
        response = requests.get(
            "http://localhost:8000/api/loto/quick-stats",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Appel API réussi: {data.get('total_draws', 0)} tirages")
            
            # Vérifier la structure des données
            if 'numbers' in data and 'complementaires' in data:
                numbers_with_data = len([n for n in data['numbers'] if n.get('count', 0) > 0])
                complementaires_with_data = len([c for c in data['complementaires'] if c.get('count', 0) > 0])
                print(f"  📊 Numéros avec données: {numbers_with_data}")
                print(f"  🍀 Complémentaires avec données: {complementaires_with_data}")
            else:
                print(f"  ⚠️ Structure de données inattendue")
        else:
            print(f"  ❌ Appel API échoué: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Erreur lors de l'appel API: {e}")
    
    # Test 4: Vérification des endpoints spécifiques
    print("\n4️⃣ Test des endpoints spécifiques:")
    endpoints = [
        "/api/loto/quick-stats",
        "/api/loto/years",
        "/api/loto/",
        "/api/loto/advanced/comprehensive-stats"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"  ✅ {endpoint}: OK")
            else:
                print(f"  ❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"  ❌ {endpoint}: {e}")
    
    print(f"\n🎯 Diagnostic terminé!")
    print(f"💡 Si tous les tests sont OK mais que le frontend n'affiche pas les données:")
    print(f"   • Vérifiez la console du navigateur (F12 → Console)")
    print(f"   • Vérifiez l'onglet Network (F12 → Network)")
    print(f"   • Utilisez le bouton '🔍 Diagnostic' dans l'interface")

if __name__ == "__main__":
    test_connection() 