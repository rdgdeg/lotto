#!/usr/bin/env python3
"""
Script de test pour l'import CSV Euromillions
"""

import requests
import os
import time

def test_import_csv():
    """Test de l'import CSV Euromillions"""
    print("🧪 Test d'import CSV Euromillions")
    print("=" * 50)
    
    # URL de l'API d'import
    url = "http://localhost:8000/api/import/"
    
    # Chemin vers le fichier de test
    csv_file_path = "euromillions_test_data.csv"
    
    if not os.path.exists(csv_file_path):
        print(f"❌ Fichier de test non trouvé: {csv_file_path}")
        return False
    
    try:
        # Préparer les données pour l'upload
        with open(csv_file_path, 'rb') as f:
            files = {'file': (csv_file_path, f, 'text/csv')}
            data = {'type': 'euromillions'}
            
            print(f"📁 Upload du fichier: {csv_file_path}")
            print(f"📊 Type: euromillions")
            
            # Faire la requête POST
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Import réussi!")
                print(f"📈 Message: {result.get('message', 'N/A')}")
                print(f"🔢 Nombre de tirages importés: {result.get('count', 'N/A')}")
                return True
            else:
                print(f"❌ Erreur lors de l'import:")
                print(f"   Status Code: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur")
        print("   Assurez-vous que le serveur backend est démarré sur http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def test_get_imported_data():
    """Test de récupération des données importées"""
    print("\n📊 Test de récupération des données importées")
    print("=" * 50)
    
    try:
        # Test de récupération des tirages Euromillions
        url = "http://localhost:8000/api/euromillions/draws"
        response = requests.get(url)
        
        if response.status_code == 200:
            draws = response.json()
            print(f"✅ {len(draws)} tirages récupérés")
            
            if draws:
                print("📅 Derniers tirages:")
                for i, draw in enumerate(draws[:5], 1):
                    print(f"   {i}. {draw.get('date', 'N/A')} - "
                          f"Numéros: {draw.get('numbers', [])} - "
                          f"Étoiles: {draw.get('stars', [])}")
            return True
        else:
            print(f"❌ Erreur lors de la récupération: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_advanced_stats():
    """Test des statistiques avancées"""
    print("\n🔥 Test des statistiques avancées")
    print("=" * 50)
    
    try:
        url = "http://localhost:8000/api/euromillions/advanced/comprehensive-stats"
        response = requests.get(url)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistiques récupérées")
            print(f"📊 Total de tirages: {stats.get('total_draws', 'N/A')}")
            print(f"📅 Période: {stats.get('date_range', {}).get('start', 'N/A')} à {stats.get('date_range', {}).get('end', 'N/A')}")
            return True
        else:
            print(f"❌ Erreur lors de la récupération des stats: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Démarrage des tests d'import CSV...")
    
    # Attendre que le serveur soit prêt
    print("⏳ Attente du démarrage du serveur...")
    time.sleep(3)
    
    # Tests
    test1 = test_import_csv()
    test2 = test_get_imported_data()
    test3 = test_advanced_stats()
    
    if test1 and test2 and test3:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Import CSV fonctionne correctement")
        print("✅ Données récupérées avec succès")
        print("✅ Statistiques avancées disponibles")
    else:
        print("\n❌ DES PROBLÈMES ONT ÉTÉ DÉTECTÉS!")
        exit(1) 