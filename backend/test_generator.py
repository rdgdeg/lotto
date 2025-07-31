#!/usr/bin/env python3
"""
Script de test pour vérifier que le générateur Euromillions ne produit pas de doublons
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.euromillions_generator import EuromillionsAdvancedGenerator
from app.euromillions_advanced_stats import EuromillionsAdvancedStats
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def test_generator_no_duplicates():
    """Test que le générateur ne produit pas de doublons"""
    print("🧪 Test du générateur Euromillions - Vérification des doublons")
    print("=" * 60)
    
    # Créer une session de base de données
    engine = create_engine('sqlite:///lotto.db')
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Initialiser le générateur
    generator = EuromillionsAdvancedGenerator(session)
    stats_calculator = EuromillionsAdvancedStats(session)
    
    # Obtenir les statistiques
    stats = stats_calculator.get_comprehensive_stats()
    
    # Tester différentes stratégies
    strategies = ['balanced', 'frequency', 'hot', 'cold', 'pattern']
    
    for strategy in strategies:
        print(f"\n📊 Test de la stratégie: {strategy}")
        print("-" * 40)
        
        # Générer 10 grilles avec cette stratégie
        grids = generator.generate_multiple_grids(10, strategy)
        
        for i, grid in enumerate(grids, 1):
            numbers = grid['numbers']
            stars = grid['stars']
            
            # Vérifier les doublons dans les numéros
            if len(numbers) != len(set(numbers)):
                print(f"❌ Grille {i}: DOUBLONS DÉTECTÉS dans les numéros!")
                print(f"   Numéros: {numbers}")
                print(f"   Doublons: {[n for n in numbers if numbers.count(n) > 1]}")
                return False
            
            # Vérifier les doublons dans les étoiles
            if len(stars) != len(set(stars)):
                print(f"❌ Grille {i}: DOUBLONS DÉTECTÉS dans les étoiles!")
                print(f"   Étoiles: {stars}")
                print(f"   Doublons: {[s for s in stars if stars.count(s) > 1]}")
                return False
            
            # Vérifier que les numéros sont dans la bonne plage
            if not all(1 <= n <= 50 for n in numbers):
                print(f"❌ Grille {i}: Numéros hors plage!")
                print(f"   Numéros: {numbers}")
                return False
            
            # Vérifier que les étoiles sont dans la bonne plage
            if not all(1 <= s <= 12 for s in stars):
                print(f"❌ Grille {i}: Étoiles hors plage!")
                print(f"   Étoiles: {stars}")
                return False
            
            print(f"✅ Grille {i}: {numbers} | Étoiles: {stars}")
    
    print("\n🎉 TOUS LES TESTS PASSÉS! Aucun doublon détecté.")
    return True

def test_simple_generator():
    """Test du générateur simple"""
    print("\n🧪 Test du générateur simple")
    print("=" * 40)
    
    # Simuler le générateur simple
    import random
    
    def generate_simple_grid():
        numbers = []
        while len(numbers) < 5:
            num = random.randint(1, 50)
            if num not in numbers:
                numbers.append(num)
        return sorted(numbers)
    
    # Tester 20 grilles
    for i in range(1, 21):
        grid = generate_simple_grid()
        if len(grid) != len(set(grid)):
            print(f"❌ Grille {i}: DOUBLONS DÉTECTÉS!")
            print(f"   Numéros: {grid}")
            return False
        print(f"✅ Grille {i}: {grid}")
    
    print("🎉 Générateur simple OK!")
    return True

if __name__ == "__main__":
    print("🚀 Démarrage des tests de génération...")
    
    # Test du générateur simple
    simple_ok = test_simple_generator()
    
    # Test du générateur avancé
    advanced_ok = test_generator_no_duplicates()
    
    if simple_ok and advanced_ok:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Aucun doublon détecté dans les générateurs")
    else:
        print("\n❌ DES PROBLÈMES ONT ÉTÉ DÉTECTÉS!")
        sys.exit(1) 