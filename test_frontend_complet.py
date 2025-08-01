#!/usr/bin/env python3
"""
Script de test complet de l'interface utilisateur
Teste tous les composants et fonctionnalités frontend
"""

import requests
import json
import time
from typing import Dict, List, Any

BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:8000"

def test_frontend_endpoints() -> List[Dict]:
    """Teste les endpoints frontend"""
    print("🔍 Test des endpoints Frontend...")
    
    endpoints = [
        ("/", "GET"),
        ("/euromillions", "GET"),
        ("/lotto", "GET"),
    ]
    
    results = []
    for url, method in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{url}", timeout=10)
            result = {
                "url": url,
                "method": method,
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "data": response.text[:200] + "..." if len(response.text) > 200 else response.text,
                "error": None
            }
        except Exception as e:
            result = {
                "url": url,
                "method": method,
                "status_code": None,
                "success": False,
                "data": None,
                "error": str(e)
            }
        
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    return results

def test_api_integration() -> List[Dict]:
    """Teste l'intégration API depuis le frontend"""
    print("\n🔍 Test de l'intégration API...")
    
    # Test des endpoints appelés par le frontend
    api_endpoints = [
        ("/api/loto/quick-stats", "GET"),
        ("/api/euromillions/quick-stats", "GET"),
        ("/api/loto/advanced/strategies", "GET"),
        ("/api/euromillions/advanced/strategies", "GET"),
        ("/api/loto/advanced/comprehensive-stats", "GET"),
        ("/api/euromillions/advanced/comprehensive-stats", "GET"),
        ("/api/loto/advanced/generate-grid", "GET"),
        ("/api/euromillions/advanced/generate-grid", "GET"),
    ]
    
    results = []
    for url, method in api_endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{API_URL}{url}", timeout=10)
            
            result = {
                "url": url,
                "method": method,
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:100],
                "error": None
            }
        except Exception as e:
            result = {
                "url": url,
                "method": method,
                "status_code": None,
                "success": False,
                "data": None,
                "error": str(e)
            }
        
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    return results

def test_specific_bugs() -> List[Dict]:
    """Teste des bugs spécifiques identifiés"""
    print("\n🔍 Test des bugs spécifiques...")
    
    bugs_to_test = [
        {
            "name": "Numéro chance Loto (1-10)",
            "test": lambda: test_loto_chance_number(),
            "description": "Vérifier que le numéro chance Loto est dans la plage 1-10"
        },
        {
            "name": "Générateur avancé Loto",
            "test": lambda: test_advanced_generator_loto(),
            "description": "Vérifier que le générateur avancé Loto fonctionne"
        },
        {
            "name": "Statistiques avancées",
            "test": lambda: test_advanced_stats(),
            "description": "Vérifier que les statistiques avancées se chargent"
        }
    ]
    
    results = []
    for bug_test in bugs_to_test:
        try:
            result = bug_test["test"]()
            results.append({
                "name": bug_test["name"],
                "success": result["success"],
                "description": bug_test["description"],
                "details": result.get("details", ""),
                "error": result.get("error", None)
            })
            
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {bug_test['name']}")
            if not result["success"] and result.get("error"):
                print(f"    Erreur: {result['error']}")
                
        except Exception as e:
            results.append({
                "name": bug_test["name"],
                "success": False,
                "description": bug_test["description"],
                "details": "",
                "error": str(e)
            })
            print(f"  ❌ {bug_test['name']}")
            print(f"    Erreur: {str(e)}")
    
    return results

def test_loto_chance_number() -> Dict:
    """Teste que le numéro chance Loto est correct"""
    try:
        # Test de génération d'une grille Loto
        response = requests.get(f"{API_URL}/api/loto/generate", timeout=10)
        if response.status_code == 200:
            data = response.json()
            grids = data.get("grids", [])
            
            for grid in grids:
                complementaire = grid.get("complementaire")
                if complementaire and (complementaire < 1 or complementaire > 10):
                    return {
                        "success": False,
                        "error": f"Numéro chance {complementaire} hors de la plage 1-10"
                    }
            
            return {"success": True, "details": "Numéro chance dans la plage correcte"}
        else:
            return {"success": False, "error": f"Erreur API: {response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def test_advanced_generator_loto() -> Dict:
    """Teste le générateur avancé Loto"""
    try:
        # Test des stratégies
        response = requests.get(f"{API_URL}/api/loto/advanced/strategies", timeout=10)
        if response.status_code != 200:
            return {"success": False, "error": f"Erreur stratégies: {response.status_code}"}
        
        # Test de génération
        response = requests.get(f"{API_URL}/api/loto/advanced/generate-grid?strategy=random", timeout=10)
        if response.status_code != 200:
            return {"success": False, "error": f"Erreur génération: {response.status_code}"}
        
        data = response.json()
        if "grid" not in data:
            return {"success": False, "error": "Format de réponse incorrect"}
        
        return {"success": True, "details": "Générateur avancé fonctionnel"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def test_advanced_stats() -> Dict:
    """Teste les statistiques avancées"""
    try:
        # Test Loto
        response = requests.get(f"{API_URL}/api/loto/advanced/comprehensive-stats", timeout=10)
        if response.status_code != 200:
            return {"success": False, "error": f"Erreur stats Loto: {response.status_code}"}
        
        # Test Euromillions
        response = requests.get(f"{API_URL}/api/euromillions/advanced/comprehensive-stats", timeout=10)
        if response.status_code != 200:
            return {"success": False, "error": f"Erreur stats Euromillions: {response.status_code}"}
        
        return {"success": True, "details": "Statistiques avancées fonctionnelles"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def analyze_results(all_results: List[Dict]) -> Dict[str, Any]:
    """Analyse les résultats des tests"""
    total_tests = len(all_results)
    successful_tests = sum(1 for r in all_results if r.get("success", False))
    failed_tests = total_tests - successful_tests
    
    # Grouper par type de test
    test_types = {}
    for result in all_results:
        if "url" in result:
            # Test d'endpoint
            if "/api/" in result["url"]:
                category = "API Integration"
            else:
                category = "Frontend"
        else:
            # Test de bug spécifique
            category = "Bugs Spécifiques"
        
        if category not in test_types:
            test_types[category] = {"total": 0, "success": 0, "failed": 0}
        
        test_types[category]["total"] += 1
        if result.get("success", False):
            test_types[category]["success"] += 1
        else:
            test_types[category]["failed"] += 1
    
    return {
        "total_tests": total_tests,
        "successful_tests": successful_tests,
        "failed_tests": failed_tests,
        "success_rate": (successful_tests / total_tests * 100) if total_tests > 0 else 0,
        "test_types": test_types,
        "failed_tests_details": [r for r in all_results if not r.get("success", False)]
    }

def main():
    """Fonction principale de test"""
    print("🚀 DÉBUT DU TEST COMPLET DE L'INTERFACE UTILISATEUR")
    print("=" * 60)
    
    # Attendre que les services soient prêts
    print("⏳ Attente du démarrage des services...")
    time.sleep(2)
    
    # Tests
    frontend_results = test_frontend_endpoints()
    api_results = test_api_integration()
    bug_results = test_specific_bugs()
    
    # Combiner tous les résultats
    all_results = frontend_results + api_results + bug_results
    
    # Analyser les résultats
    analysis = analyze_results(all_results)
    
    # Afficher le rapport
    print("\n" + "=" * 60)
    print("📊 RAPPORT DE TEST FRONTEND COMPLET")
    print("=" * 60)
    
    print(f"Total des tests: {analysis['total_tests']}")
    print(f"Tests réussis: {analysis['successful_tests']}")
    print(f"Tests échoués: {analysis['failed_tests']}")
    print(f"Taux de succès: {analysis['success_rate']:.1f}%")
    
    print("\n📈 Répartition par catégorie:")
    for category, stats in analysis["test_types"].items():
        success_rate = (stats["success"] / stats["total"] * 100) if stats["total"] > 0 else 0
        print(f"  {category}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
    
    if analysis["failed_tests_details"]:
        print("\n❌ Tests en échec:")
        for test in analysis["failed_tests_details"]:
            if "name" in test:
                print(f"  {test['name']}: {test.get('error', 'Erreur inconnue')}")
            else:
                print(f"  {test['method']} {test['url']}: {test.get('error', 'Erreur inconnue')}")
    
    # Sauvegarder le rapport
    with open("rapport_test_frontend.json", "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Rapport sauvegardé dans 'rapport_test_frontend.json'")
    
    return analysis

if __name__ == "__main__":
    main() 