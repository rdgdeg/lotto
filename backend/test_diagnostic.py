#!/usr/bin/env python3
"""
Script de test pour vérifier les endpoints du diagnostic des données
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(endpoint, description):
    """Teste un endpoint et affiche le résultat"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {description}: OK")
            if 'total_draws' in data:
                print(f"   📊 Total tirages: {data['total_draws']}")
            if 'years' in data:
                print(f"   📅 Années disponibles: {len(data['years'])}")
            return True
        else:
            print(f"❌ {description}: Erreur {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {description}: Erreur - {str(e)}")
        return False

def main():
    print("🔍 TEST DU DIAGNOSTIC DES DONNÉES")
    print("=" * 50)
    
    # Test de santé de l'API
    print("\n1. Test de santé de l'API:")
    test_endpoint("/loto/", "API Backend")
    
    # Test des statistiques Loto
    print("\n2. Test des statistiques Loto:")
    test_endpoint("/loto/stats", "Stats Loto")
    
    # Test des années Loto
    print("\n3. Test des années Loto:")
    test_endpoint("/loto/years", "Années Loto")
    
    # Test des statistiques Euromillions
    print("\n4. Test des statistiques Euromillions:")
    test_endpoint("/euromillions/stats", "Stats Euromillions")
    
    # Test des années Euromillions
    print("\n5. Test des années Euromillions:")
    test_endpoint("/euromillions/years", "Années Euromillions")
    
    print("\n" + "=" * 50)
    print("🎯 Diagnostic terminé !")

if __name__ == "__main__":
    main() 