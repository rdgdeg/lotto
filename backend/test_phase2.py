#!/usr/bin/env python3
"""
Script de test pour vérifier les fonctionnalités de la Phase 2
"""

import time
import requests
import json
from datetime import datetime

def test_gap_analysis():
    """Teste l'analyse des gaps"""
    print("🧪 TEST DE L'ANALYSE DES GAPS")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    print("\n📊 Test: Analyse des gaps")
    start_time = time.time()
    response = requests.get(f"{base_url}/gap-analysis")
    request_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Analyse terminée en {request_time:.3f}s")
        print(f"📈 Tirages analysés: {data.get('total_draws_analyzed', 0)}")
        
        # Afficher les statistiques
        gap_stats = data.get('gap_statistics', {})
        print(f"🔢 Numéros analysés: {gap_stats.get('total_numbers_analyzed', 0)}")
        print(f"⏰ Numéros en retard: {gap_stats.get('overdue_numbers', 0)} ({gap_stats.get('overdue_percentage', 0)}%)")
        
        # Afficher les prédictions
        predictions = data.get('predictions', [])
        print(f"🎯 Prédictions générées: {len(predictions)}")
        
        if predictions:
            best_prediction = predictions[0]
            print(f"🏆 Meilleure prédiction:")
            print(f"   Score: {best_prediction.get('average_score', 0)}")
            print(f"   Confiance: {best_prediction.get('confidence', 'N/A')}")
            print(f"   Numéros: {[num['numero'] for num in best_prediction.get('numbers', [])]}")
        
        # Afficher les numéros les plus en retard
        most_overdue = gap_stats.get('most_overdue_numbers', [])[:5]
        if most_overdue:
            print(f"\n⏰ Top 5 des numéros les plus en retard:")
            for i, num_info in enumerate(most_overdue, 1):
                print(f"   {i}. Numéro {num_info['numero']}: {num_info['current_gap']} jours (facteur: {num_info['overdue_factor']})")
        
    else:
        print(f"❌ Erreur: {response.status_code}")
        print(f"   Détail: {response.text}")

def test_combination_analysis():
    """Teste l'analyse des combinaisons"""
    print("\n\n🧪 TEST DE L'ANALYSE DES COMBINAISONS")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    print("\n📊 Test: Analyse des combinaisons (taille 2-4)")
    start_time = time.time()
    response = requests.get(f"{base_url}/combination-analysis?min_size=2&max_size=4")
    request_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Analyse terminée en {request_time:.3f}s")
        print(f"📈 Tirages analysés: {data.get('total_draws_analyzed', 0)}")
        
        # Afficher les statistiques
        combo_stats = data.get('combination_statistics', {})
        print(f"🔢 Combinaisons analysées: {combo_stats.get('total_combinations_analyzed', 0)}")
        print(f"⭐ Combinaisons fréquentes: {combo_stats.get('frequent_combinations_count', 0)}")
        
        # Afficher les statistiques par taille
        size_stats = combo_stats.get('size_statistics', {})
        for size, stats in size_stats.items():
            print(f"\n📏 {size.upper()}:")
            print(f"   Total: {stats.get('total_combinations', 0)}")
            print(f"   Fréquentes: {stats.get('frequent_combinations', 0)}")
            print(f"   Moyenne: {stats.get('average_occurrences', 0)} occurrences")
        
        # Afficher les prédictions
        predictions = data.get('predictions', [])
        print(f"\n🎯 Prédictions générées: {len(predictions)}")
        
        if predictions:
            best_prediction = predictions[0]
            print(f"🏆 Meilleure prédiction:")
            print(f"   Score: {best_prediction.get('prediction_score', 0)}")
            print(f"   Confiance: {best_prediction.get('confidence', 'N/A')}")
            print(f"   Numéros: {best_prediction.get('numbers', [])}")
            print(f"   Combinaisons de base: {len(best_prediction.get('base_combinations', []))}")
        
        # Afficher les top combinaisons
        top_combinations = combo_stats.get('top_combinations', [])[:5]
        if top_combinations:
            print(f"\n🏆 Top 5 des combinaisons les plus fréquentes:")
            for i, combo_info in enumerate(top_combinations, 1):
                print(f"   {i}. {combo_info['combination']}: {combo_info['occurrences']} fois ({combo_info['frequency_percentage']}%)")
        
    else:
        print(f"❌ Erreur: {response.status_code}")
        print(f"   Détail: {response.text}")

def test_grid_scoring():
    """Teste le système de scoring des grilles"""
    print("\n\n🧪 TEST DU SYSTÈME DE SCORING")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test avec une grille
    test_grid = [7, 13, 25, 38, 42]
    
    print(f"\n📊 Test: Scoring d'une grille {test_grid}")
    start_time = time.time()
    response = requests.post(
        f"{base_url}/score-grid",
        json=test_grid,
        headers={'Content-Type': 'application/json'}
    )
    request_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Scoring terminé en {request_time:.3f}s")
        
        scoring_result = data.get('scoring_result', {})
        print(f"🏆 Score total: {scoring_result.get('total_score', 0)}")
        print(f"🎯 Niveau de confiance: {scoring_result.get('confidence_level', 'N/A')}")
        
        # Afficher les scores détaillés
        scores = scoring_result.get('scores', {})
        print(f"\n📊 Scores détaillés:")
        for metric, score in scores.items():
            print(f"   {metric}: {score}")
        
        # Afficher l'analyse de la grille
        grid_analysis = scoring_result.get('grid_analysis', {})
        print(f"\n🔍 Analyse de la grille:")
        print(f"   Somme: {grid_analysis.get('sum', 0)}")
        print(f"   Moyenne: {grid_analysis.get('average', 0)}")
        print(f"   Plage: {grid_analysis.get('range', 0)}")
        print(f"   Pair/Impair: {grid_analysis.get('even_odd_ratio', {}).get('ratio', 'N/A')}")
        print(f"   Haut/Bas: {grid_analysis.get('high_low_ratio', {}).get('ratio', 'N/A')}")
        
        # Afficher les recommandations
        recommendations = scoring_result.get('recommendations', [])
        if recommendations:
            print(f"\n💡 Recommandations:")
            for rec in recommendations:
                print(f"   • {rec}")
        
    else:
        print(f"❌ Erreur: {response.status_code}")
        print(f"   Détail: {response.text}")

def test_grid_comparison():
    """Teste la comparaison de grilles"""
    print("\n\n🧪 TEST DE LA COMPARAISON DE GRILLES")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test avec plusieurs grilles
    test_grids = [
        [7, 13, 25, 38, 42],   # Grille 1
        [3, 11, 19, 31, 47],   # Grille 2
        [5, 15, 22, 33, 44],   # Grille 3
        [2, 8, 16, 28, 39],    # Grille 4
        [9, 17, 26, 35, 48]    # Grille 5
    ]
    
    print(f"\n📊 Test: Comparaison de {len(test_grids)} grilles")
    start_time = time.time()
    response = requests.post(
        f"{base_url}/compare-grids",
        json=test_grids,
        headers={'Content-Type': 'application/json'}
    )
    request_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Comparaison terminée en {request_time:.3f}s")
        
        # Afficher les statistiques
        scoring_stats = data.get('scoring_statistics', {})
        print(f"\n📈 Statistiques de scoring:")
        print(f"   Score moyen: {scoring_stats.get('average_score', 0)}")
        print(f"   Score médian: {scoring_stats.get('median_score', 0)}")
        print(f"   Meilleur score: {scoring_stats.get('best_score', 0)}")
        print(f"   Pire score: {scoring_stats.get('worst_score', 0)}")
        
        # Afficher la distribution des scores
        score_dist = scoring_stats.get('score_distribution', {})
        print(f"\n📊 Distribution des scores:")
        for level, count in score_dist.items():
            print(f"   {level}: {count} grilles")
        
        # Afficher le classement
        comparison_result = data.get('comparison_result', [])
        print(f"\n🏆 Classement des grilles:")
        for i, grid_result in enumerate(comparison_result[:3], 1):
            print(f"   {i}. Grille {grid_result['grid_id']}: {grid_result['numbers']}")
            print(f"      Score: {grid_result['score']} | Confiance: {grid_result['confidence']}")
        
    else:
        print(f"❌ Erreur: {response.status_code}")
        print(f"   Détail: {response.text}")

def test_advanced_generation():
    """Teste la génération avancée avec les nouvelles stratégies"""
    print("\n\n🧪 TEST DE LA GÉNÉRATION AVANCÉE")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test avec la stratégie gap_based
    print(f"\n📊 Test: Génération avec stratégie 'gap_based'")
    params = {
        'strategy': 'gap_based',
        'num_grids': 3
    }
    
    start_time = time.time()
    response = requests.post(f"{base_url}/generate-advanced", params=params)
    post_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        task_id = data.get('task_id')
        print(f"✅ Tâche lancée en {post_time:.3f}s")
        print(f"🆔 ID de tâche: {task_id}")
        print(f"📋 Message: {data.get('message', '')}")
        
        # Vérifier le statut de la tâche
        print("\n⏳ Vérification du statut de la tâche...")
        max_attempts = 15  # Plus de temps pour l'analyse complexe
        for attempt in range(max_attempts):
            time.sleep(3)  # Attendre 3 secondes
            
            status_response = requests.get(f"{base_url}/task-status/{task_id}")
            if status_response.status_code == 200:
                status_data = status_response.json()
                state = status_data.get('state')
                
                print(f"   Tentative {attempt + 1}: {state}")
                
                if state == 'SUCCESS':
                    result = status_data.get('result', {})
                    grids = result.get('grids', [])
                    print(f"✅ Génération terminée!")
                    print(f"📊 Grilles générées: {len(grids)}")
                    print(f"💾 Cache utilisé: {result.get('cached', False)}")
                    print(f"📈 Tirages analysés: {result.get('total_draws_analyzed', 0)}")
                    
                    # Afficher les grilles générées
                    for i, grid in enumerate(grids[:3], 1):
                        print(f"   Grille {i}: {grid.get('numbers', [])} (Score: {grid.get('average_score', 0)})")
                    break
                elif state == 'FAILURE':
                    print(f"❌ Échec de la génération: {status_data.get('error', 'Erreur inconnue')}")
                    break
            else:
                print(f"❌ Erreur lors de la vérification du statut: {status_response.status_code}")
                break
        else:
            print("⏰ Timeout: La tâche prend trop de temps")
    else:
        print(f"❌ Erreur lors du lancement: {response.status_code}")

def main():
    """Fonction principale de test"""
    print("🚀 TESTS DE LA PHASE 2 - INTELLIGENCE ARTIFICIELLE")
    print("=" * 60)
    print(f"⏰ Début des tests: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test 1: Analyse des gaps
        test_gap_analysis()
        
        # Test 2: Analyse des combinaisons
        test_combination_analysis()
        
        # Test 3: Scoring des grilles
        test_grid_scoring()
        
        # Test 4: Comparaison de grilles
        test_grid_comparison()
        
        # Test 5: Génération avancée
        test_advanced_generation()
        
        print("\n\n✅ TOUS LES TESTS DE LA PHASE 2 TERMINÉS")
        print("=" * 60)
        print(f"⏰ Fin des tests: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n🎯 Fonctionnalités testées:")
        print("   ✅ Analyse des gaps (intervalles)")
        print("   ✅ Analyse des combinaisons fréquentes")
        print("   ✅ Système de scoring avancé")
        print("   ✅ Comparaison de grilles")
        print("   ✅ Génération avec IA")
        
    except Exception as e:
        print(f"\n❌ ERREUR LORS DES TESTS: {e}")
        print("Assurez-vous que:")
        print("1. Le serveur backend est démarré")
        print("2. Redis et Celery sont actifs")
        print("3. Les dépendances sont installées")

if __name__ == "__main__":
    main() 