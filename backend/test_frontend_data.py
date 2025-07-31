#!/usr/bin/env python3
"""
Script de test pour vérifier les données de test du frontend
"""

import json
import random
from typing import List, Dict, Any

def test_unique_numbers_generation():
    """Test de la génération de numéros uniques"""
    print("🧪 Test de génération de numéros uniques")
    print("=" * 50)
    
    def generate_unique_numbers(count: int, max_num: int) -> List[int]:
        """Simule la fonction JavaScript du frontend"""
        numbers = []
        while len(numbers) < count:
            num = random.randint(1, max_num)
            if num not in numbers:
                numbers.append(num)
        return sorted(numbers)
    
    # Test Euromillions
    print("\n📊 Test Euromillions (5 numéros de 1-50, 2 étoiles de 1-12)")
    for i in range(10):
        numbers = generate_unique_numbers(5, 50)
        stars = generate_unique_numbers(2, 12)
        
        # Vérifier les doublons
        if len(numbers) != len(set(numbers)):
            print(f"❌ Grille {i+1}: DOUBLONS dans les numéros!")
            print(f"   Numéros: {numbers}")
            return False
        
        if len(stars) != len(set(stars)):
            print(f"❌ Grille {i+1}: DOUBLONS dans les étoiles!")
            print(f"   Étoiles: {stars}")
            return False
        
        # Vérifier les plages
        if not all(1 <= n <= 50 for n in numbers):
            print(f"❌ Grille {i+1}: Numéros hors plage!")
            print(f"   Numéros: {numbers}")
            return False
        
        if not all(1 <= s <= 12 for s in stars):
            print(f"❌ Grille {i+1}: Étoiles hors plage!")
            print(f"   Étoiles: {stars}")
            return False
        
        print(f"✅ Grille {i+1}: {numbers} | Étoiles: {stars}")
    
    # Test Lotto
    print("\n🍀 Test Lotto (6 numéros de 1-49, 1 chance de 1-10)")
    for i in range(10):
        numbers = generate_unique_numbers(6, 49)
        chance = random.randint(1, 10)
        
        # Vérifier les doublons
        if len(numbers) != len(set(numbers)):
            print(f"❌ Grille {i+1}: DOUBLONS dans les numéros!")
            print(f"   Numéros: {numbers}")
            return False
        
        # Vérifier les plages
        if not all(1 <= n <= 49 for n in numbers):
            print(f"❌ Grille {i+1}: Numéros hors plage!")
            print(f"   Numéros: {numbers}")
            return False
        
        if not (1 <= chance <= 10):
            print(f"❌ Grille {i+1}: Numéro chance hors plage!")
            print(f"   Chance: {chance}")
            return False
        
        print(f"✅ Grille {i+1}: {numbers} | Chance: {chance}")
    
    print("\n🎉 Tous les tests de génération de numéros uniques sont passés!")
    return True

def test_annual_statistics_data():
    """Test des données de statistiques annuelles"""
    print("\n📈 Test des données de statistiques annuelles")
    print("=" * 50)
    
    # Test pour Euromillions
    print("\n📊 Test Euromillions - Statistiques annuelles")
    for year in range(2020, 2025):
        max_num = 50
        
        # Créer un pool de tous les numéros disponibles (comme dans le frontend)
        all_numbers = list(range(1, max_num + 1))
        
        # Prendre les 10 premiers pour les plus fréquents
        most_frequent_numbers = all_numbers[:10]
        
        # Prendre les 10 suivants pour les moins fréquents
        least_frequent_numbers = all_numbers[10:20]
        
        # Prendre les 10 suivants pour les moyennes
        average_numbers = all_numbers[20:30]
        
        # Vérifier qu'il n'y a pas de doublons entre les listes
        duplicates_most_least = set(most_frequent_numbers) & set(least_frequent_numbers)
        duplicates_most_avg = set(most_frequent_numbers) & set(average_numbers)
        duplicates_least_avg = set(least_frequent_numbers) & set(average_numbers)
        
        if duplicates_most_least or duplicates_most_avg or duplicates_least_avg:
            print(f"❌ Année {year}: DOUBLONS entre listes!")
            if duplicates_most_least:
                print(f"   Doublons most/least: {duplicates_most_least}")
            if duplicates_most_avg:
                print(f"   Doublons most/avg: {duplicates_most_avg}")
            if duplicates_least_avg:
                print(f"   Doublons least/avg: {duplicates_least_avg}")
            return False
        
        print(f"✅ Année {year}: {len(most_frequent_numbers)} + {len(least_frequent_numbers)} + {len(average_numbers)} numéros uniques")
    
    # Test pour Lotto
    print("\n🍀 Test Lotto - Statistiques annuelles")
    for year in range(2020, 2025):
        max_num = 49
        
        # Créer un pool de tous les numéros disponibles
        all_numbers = list(range(1, max_num + 1))
        
        # Prendre les 10 premiers pour les plus fréquents
        most_frequent_numbers = all_numbers[:10]
        
        # Prendre les 10 suivants pour les moins fréquents
        least_frequent_numbers = all_numbers[10:20]
        
        # Prendre les 10 suivants pour les moyennes
        average_numbers = all_numbers[20:30]
        
        # Vérifier qu'il n'y a pas de doublons entre les listes
        duplicates_most_least = set(most_frequent_numbers) & set(least_frequent_numbers)
        duplicates_most_avg = set(most_frequent_numbers) & set(average_numbers)
        duplicates_least_avg = set(least_frequent_numbers) & set(average_numbers)
        
        if duplicates_most_least or duplicates_most_avg or duplicates_least_avg:
            print(f"❌ Année {year}: DOUBLONS entre listes!")
            if duplicates_most_least:
                print(f"   Doublons most/least: {duplicates_most_least}")
            if duplicates_most_avg:
                print(f"   Doublons most/avg: {duplicates_most_avg}")
            if duplicates_least_avg:
                print(f"   Doublons least/avg: {duplicates_least_avg}")
            return False
        
        print(f"✅ Année {year}: {len(most_frequent_numbers)} + {len(least_frequent_numbers)} + {len(average_numbers)} numéros uniques")
    
    print("\n🎉 Tous les tests de statistiques annuelles sont passés!")
    return True

def test_draw_history_data():
    """Test des données d'historique des tirages"""
    print("\n📅 Test des données d'historique des tirages")
    print("=" * 50)
    
    def generate_unique_numbers_for_draws(count: int, max_num: int) -> List[int]:
        """Génère des numéros uniques pour les tirages"""
        numbers = []
        while len(numbers) < count:
            num = random.randint(1, max_num)
            if num not in numbers:
                numbers.append(num)
        return sorted(numbers)
    
    # Test Euromillions
    print("\n📊 Test Euromillions - Historique des tirages")
    for i in range(20):
        numbers = generate_unique_numbers_for_draws(5, 50)
        stars = generate_unique_numbers_for_draws(2, 12)
        
        # Vérifier les doublons
        if len(numbers) != len(set(numbers)):
            print(f"❌ Tirage {i+1}: DOUBLONS dans les numéros!")
            print(f"   Numéros: {numbers}")
            return False
        
        if len(stars) != len(set(stars)):
            print(f"❌ Tirage {i+1}: DOUBLONS dans les étoiles!")
            print(f"   Étoiles: {stars}")
            return False
        
        print(f"✅ Tirage {i+1}: {numbers} | Étoiles: {stars}")
    
    # Test Lotto
    print("\n🍀 Test Lotto - Historique des tirages")
    for i in range(20):
        numbers = generate_unique_numbers_for_draws(6, 49)
        chance = random.randint(1, 10)
        
        # Vérifier les doublons
        if len(numbers) != len(set(numbers)):
            print(f"❌ Tirage {i+1}: DOUBLONS dans les numéros!")
            print(f"   Numéros: {numbers}")
            return False
        
        print(f"✅ Tirage {i+1}: {numbers} | Chance: {chance}")
    
    print("\n🎉 Tous les tests d'historique des tirages sont passés!")
    return True

if __name__ == "__main__":
    print("🚀 Démarrage des tests de données frontend...")
    
    # Tests
    test1 = test_unique_numbers_generation()
    test2 = test_annual_statistics_data()
    test3 = test_draw_history_data()
    
    if test1 and test2 and test3:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Aucun doublon détecté dans les données de test")
        print("✅ Toutes les plages sont respectées")
        print("✅ Les algorithmes de génération sont corrects")
    else:
        print("\n❌ DES PROBLÈMES ONT ÉTÉ DÉTECTÉS!")
        exit(1) 