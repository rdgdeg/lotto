#!/usr/bin/env python3
"""
Script de test pour vérifier les optimisations de la Phase 1
"""

import time
import requests
import json
from datetime import datetime

def test_cache_performance():
    """Teste les performances du cache"""
    print("🧪 TEST DES PERFORMANCES DU CACHE")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test 1: Première requête (sans cache)
    print("\n📊 Test 1: Première requête (calcul direct)")
    start_time = time.time()
    response1 = requests.get(f"{base_url}/quick-stats")
    first_request_time = time.time() - start_time
    
    if response1.status_code == 200:
        data1 = response1.json()
        print(f"✅ Temps de réponse: {first_request_time:.3f}s")
        print(f"📈 Tirages analysés: {data1.get('total_draws', 0)}")
        print(f"💾 Cache utilisé: {data1.get('cached', False)}")
    else:
        print(f"❌ Erreur: {response1.status_code}")
        return
    
    # Test 2: Deuxième requête (avec cache)
    print("\n📊 Test 2: Deuxième requête (avec cache)")
    start_time = time.time()
    response2 = requests.get(f"{base_url}/quick-stats")
    second_request_time = time.time() - start_time
    
    if response2.status_code == 200:
        data2 = response2.json()
        print(f"✅ Temps de réponse: {second_request_time:.3f}s")
        print(f"💾 Cache utilisé: {data2.get('cached', False)}")
        
        # Calculer l'amélioration
        if first_request_time > 0:
            improvement = ((first_request_time - second_request_time) / first_request_time) * 100
            print(f"🚀 Amélioration: {improvement:.1f}%")
    else:
        print(f"❌ Erreur: {response2.status_code}")
    
    # Test 3: Requête avec filtre (nouveau cache)
    print("\n📊 Test 3: Requête avec filtre par année")
    start_time = time.time()
    response3 = requests.get(f"{base_url}/quick-stats?year=2025")
    filtered_request_time = time.time() - start_time
    
    if response3.status_code == 200:
        data3 = response3.json()
        print(f"✅ Temps de réponse: {filtered_request_time:.3f}s")
        print(f"📈 Tirages analysés: {data3.get('total_draws', 0)}")
        print(f"💾 Cache utilisé: {data3.get('cached', False)}")
    else:
        print(f"❌ Erreur: {response3.status_code}")

def test_async_generation():
    """Teste la génération asynchrone"""
    print("\n\n🧪 TEST DE LA GÉNÉRATION ASYNCHRONE")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test de génération asynchrone
    print("\n📊 Test: Génération asynchrone avec stratégie 'frequency_based'")
    
    params = {
        'strategy': 'frequency_based',
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
        max_attempts = 10
        for attempt in range(max_attempts):
            time.sleep(2)  # Attendre 2 secondes
            
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

def test_performance_metrics():
    """Teste les métriques de performance"""
    print("\n\n🧪 TEST DES MÉTRIQUES DE PERFORMANCE")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test des métriques de performance
    print("\n📊 Test: Récupération des métriques de performance")
    
    response = requests.get(f"{base_url}/performance-metrics?days=7")
    
    if response.status_code == 200:
        data = response.json()
        
        print("✅ Métriques récupérées avec succès")
        
        # Afficher le résumé des performances
        performance_summary = data.get('performance_summary', {})
        print(f"\n📈 Résumé des performances (7 jours):")
        print(f"   Générations totales: {performance_summary.get('total_generations', 0)}")
        print(f"   Temps moyen de génération: {performance_summary.get('average_generation_time', 0)}s")
        print(f"   Taux de hit cache: {performance_summary.get('cache_hit_rate', 0)}%")
        print(f"   Stratégies utilisées: {', '.join(performance_summary.get('strategies_used', []))}")
        
        # Afficher les métriques du cache
        cache_performance = data.get('cache_performance', {})
        print(f"\n💾 Performance du cache:")
        print(f"   Statut: {cache_performance.get('cache_status', 'inconnu')}")
        print(f"   Mémoire utilisée: {cache_performance.get('used_memory', 'N/A')}")
        print(f"   Requêtes totales: {cache_performance.get('total_requests', 0)}")
        print(f"   Hits: {cache_performance.get('cache_hits', 0)}")
        print(f"   Misses: {cache_performance.get('cache_misses', 0)}")
        print(f"   Taux de hit: {cache_performance.get('hit_rate', 0)}%")
        
    else:
        print(f"❌ Erreur: {response.status_code}")

def test_cache_info():
    """Teste les informations du cache"""
    print("\n\n🧪 TEST DES INFORMATIONS DU CACHE")
    print("=" * 50)
    
    base_url = "http://localhost:8000/api/euromillions"
    
    # Test des informations du cache
    print("\n📊 Test: Informations du cache")
    
    response = requests.get(f"{base_url}/performance-metrics")
    
    if response.status_code == 200:
        data = response.json()
        cache_info = data.get('cache_info', {})
        
        print("✅ Informations du cache récupérées")
        print(f"   Connecté: {cache_info.get('connected', False)}")
        
        if cache_info.get('connected'):
            print(f"   Mémoire utilisée: {cache_info.get('used_memory', 'N/A')}")
            print(f"   Connexions totales: {cache_info.get('total_connections_received', 0)}")
            print(f"   Commandes totales: {cache_info.get('total_commands_processed', 0)}")
        else:
            print(f"   Erreur: {cache_info.get('error', 'Erreur inconnue')}")
    else:
        print(f"❌ Erreur: {response.status_code}")

def main():
    """Fonction principale de test"""
    print("🚀 TESTS DES OPTIMISATIONS - PHASE 1")
    print("=" * 60)
    print(f"⏰ Début des tests: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test 1: Performance du cache
        test_cache_performance()
        
        # Test 2: Génération asynchrone
        test_async_generation()
        
        # Test 3: Métriques de performance
        test_performance_metrics()
        
        # Test 4: Informations du cache
        test_cache_info()
        
        print("\n\n✅ TOUS LES TESTS TERMINÉS")
        print("=" * 60)
        print(f"⏰ Fin des tests: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\n❌ ERREUR LORS DES TESTS: {e}")
        print("Assurez-vous que:")
        print("1. Le serveur backend est démarré")
        print("2. Redis est installé et démarré")
        print("3. Celery est configuré")

if __name__ == "__main__":
    main() 