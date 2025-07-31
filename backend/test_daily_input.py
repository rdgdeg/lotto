#!/usr/bin/env python3
"""
Script de test pour vérifier l'endpoint add-draw
"""

import requests
import json
from datetime import datetime, timedelta

def test_add_draw():
    """Teste l'ajout d'un tirage via l'API"""
    
    # URL de l'API
    base_url = "http://localhost:8000"
    
    # Données de test pour Euromillions
    euromillions_data = {
        "date": "2025-07-31",
        "numeros": [7, 15, 23, 34, 45],
        "etoiles": [3, 8]
    }
    
    # Données de test pour Loto
    loto_data = {
        "date": "2025-07-31",
        "numeros": [5, 12, 18, 25, 33, 42],
        "complementaire": 7
    }
    
    print("🧪 Test de l'endpoint add-draw")
    print("=" * 50)
    
    # Test Euromillions
    print("\n🎰 Test Euromillions:")
    try:
        response = requests.post(
            f"{base_url}/api/euromillions/add-draw",
            json=euromillions_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès: {result['message']}")
            print(f"📊 Tirage ajouté: {result['draw']}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
    
    # Test Loto
    print("\n🍀 Test Loto:")
    try:
        response = requests.post(
            f"{base_url}/api/loto/add-draw",
            json=loto_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès: {result['message']}")
            print(f"📊 Tirage ajouté: {result['draw']}")
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
    
    # Vérifier le total après ajout
    print("\n📊 Vérification du total:")
    try:
        response = requests.get(f"{base_url}/api/history/summary")
        if response.status_code == 200:
            data = response.json()
            print(f"🎰 Euromillions: {data['euromillions']['total_draws']} tirages")
            print(f"🍀 Loto: {data['loto']['total_draws']} tirages")
        else:
            print(f"❌ Erreur lors de la vérification: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")

def test_validation_errors():
    """Teste les validations d'erreur"""
    
    base_url = "http://localhost:8000"
    
    print("\n🔍 Test des validations d'erreur:")
    print("=" * 50)
    
    # Test avec des numéros invalides
    invalid_data = {
        "date": "2025-07-31",
        "numeros": [1, 2, 3, 4, 60],  # 60 > 50
        "etoiles": [1, 2]
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/euromillions/add-draw",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            result = response.json()
            print(f"✅ Validation OK: {result['detail']}")
        else:
            print(f"❌ Validation échouée: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_add_draw()
    test_validation_errors() 