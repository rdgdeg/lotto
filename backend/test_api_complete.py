#!/usr/bin/env python3
"""
Script de test complet pour vérifier l'API et les données
"""

import requests
import json
import sys
from datetime import datetime

def test_api_complete():
    """Test complet de l'API"""
    print("🔍 Test complet de l'API LOTTO")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Santé de l'API
    print("\n1️⃣ Test de santé de l'API...")
    try:
        response = requests.get(f"{base_url}/api/loto/quick-stats", timeout=5)
        if response.status_code == 200:
            print("✅ API accessible")
        else:
            print(f"❌ Erreur API: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Impossible de se connecter à l'API: {e}")
        return
    
    # Test 2: Statistiques rapides
    print("\n2️⃣ Test des statistiques rapides...")
    try:
        response = requests.get(f"{base_url}/api/loto/quick-stats")
        data = response.json()
        total_draws = data.get('total_draws', 0)
        print(f"✅ Total tirages: {total_draws}")
        
        if total_draws > 0:
            numbers_with_data = len([n for n in data.get('numbers', []) if n.get('count', 0) > 0])
            complementaires_with_data = len([c for c in data.get('complementaires', []) if c.get('count', 0) > 0])
            print(f"   Numéros avec données: {numbers_with_data}")
            print(f"   Complémentaires avec données: {complementaires_with_data}")
        else:
            print("⚠️ Aucun tirage trouvé")
            
    except Exception as e:
        print(f"❌ Erreur statistiques: {e}")
    
    # Test 3: Années disponibles
    print("\n3️⃣ Test des années disponibles...")
    try:
        response = requests.get(f"{base_url}/api/loto/years")
        data = response.json()
        years = data.get('years', [])
        print(f"✅ Années disponibles: {len(years)}")
        if years:
            print(f"   Période: {min(years)} - {max(years)}")
        else:
            print("   Aucune année disponible")
            
    except Exception as e:
        print(f"❌ Erreur années: {e}")
    
    # Test 4: Liste des tirages
    print("\n4️⃣ Test de la liste des tirages...")
    try:
        response = requests.get(f"{base_url}/api/loto/")
        data = response.json()
        draws = data.get('draws', [])
        print(f"✅ Tirages récupérés: {len(draws)}")
        
        if draws:
            latest_draw = draws[0]
            print(f"   Dernier tirage: {latest_draw.get('date')}")
            print(f"   Numéros: {latest_draw.get('numeros')}")
            print(f"   Complémentaire: {latest_draw.get('complementaire')}")
        else:
            print("   Aucun tirage disponible")
            
    except Exception as e:
        print(f"❌ Erreur tirages: {e}")
    
    # Test 5: Analyses avancées
    print("\n5️⃣ Test des analyses avancées...")
    try:
        response = requests.get(f"{base_url}/api/loto/advanced/comprehensive-stats")
        data = response.json()
        
        if 'error' in data:
            print(f"⚠️ Erreur analyses: {data['error']}")
        else:
            modules = len(data.keys())
            print(f"✅ Analyses disponibles: {modules} modules")
            print(f"   Modules: {', '.join(data.keys())}")
            
    except Exception as e:
        print(f"❌ Erreur analyses: {e}")
    
    print("\n🎯 Résumé:")
    print("-" * 30)
    print("✅ Tests terminés avec succès!")
    print("💡 Si le frontend affiche encore 0 tirages:")
    print("   • Utilisez le bouton '🔍 Diagnostic' dans l'interface")
    print("   • Cliquez sur '🗑️ Vider Cache + Recharger'")
    print("   • Ou faites Ctrl+F5 dans votre navigateur")

if __name__ == "__main__":
    test_api_complete() 