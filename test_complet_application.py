#!/usr/bin/env python3
"""
Script de test complet de l'application Lotto & Euromillions
Teste tous les endpoints et fonctionnalités
"""

import requests
import json
import time
from typing import Dict, List, Any

BASE_URL = "http://localhost:8000"

def test_endpoint(url: str, method: str = "GET", data: Dict = None) -> Dict[str, Any]:
    """Teste un endpoint et retourne le résultat"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{url}", timeout=10)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{url}", json=data, timeout=10)
        
        return {
            "url": url,
            "method": method,
            "status_code": response.status_code,
            "success": response.status_code < 400,
            "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            "error": None
        }
    except Exception as e:
        return {
            "url": url,
            "method": method,
            "status_code": None,
            "success": False,
            "data": None,
            "error": str(e)
        }

def test_loto_endpoints() -> List[Dict]:
    """Teste tous les endpoints Loto"""
    print("🔍 Test des endpoints Loto...")
    
    endpoints = [
        ("/api/loto/draws", "GET"),
        ("/api/loto/stats", "GET"),
        ("/api/loto/quick-stats", "GET"),
        ("/api/loto/advanced/strategies", "GET"),
        ("/api/loto/advanced/comprehensive-stats", "GET"),
        ("/api/loto/advanced/hot-cold-analysis", "GET"),
        ("/api/loto/advanced/frequent-combinations", "GET"),
        ("/api/loto/advanced/patterns", "GET"),
        ("/api/loto/advanced/sequences", "GET"),
        ("/api/loto/advanced/parity", "GET"),
        ("/api/loto/advanced/sums", "GET"),
        ("/api/loto/advanced/yearly-breakdown", "GET"),
        ("/api/loto/advanced/performance-metrics", "GET"),
    ]
    
    results = []
    for url, method in endpoints:
        result = test_endpoint(url, method)
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    return results

def test_euromillions_endpoints() -> List[Dict]:
    """Teste tous les endpoints Euromillions"""
    print("\n🔍 Test des endpoints Euromillions...")
    
    endpoints = [
        ("/api/euromillions/draws", "GET"),
        ("/api/euromillions/stats", "GET"),
        ("/api/euromillions/quick-stats", "GET"),
        ("/api/euromillions/advanced/strategies", "GET"),
        ("/api/euromillions/advanced/comprehensive-stats", "GET"),
        ("/api/euromillions/advanced/hot-cold-analysis", "GET"),
        ("/api/euromillions/advanced/frequent-combinations", "GET"),
        ("/api/euromillions/advanced/patterns", "GET"),
        ("/api/euromillions/advanced/payout-table", "GET"),
    ]
    
    results = []
    for url, method in endpoints:
        result = test_endpoint(url, method)
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    return results

def test_common_endpoints() -> List[Dict]:
    """Teste les endpoints communs"""
    print("\n🔍 Test des endpoints communs...")
    
    endpoints = [
        ("/", "GET"),
        ("/docs", "GET"),
        ("/api/history/euromillions", "GET"),
        ("/api/history/loto", "GET"),
    ]
    
    results = []
    for endpoint in endpoints:
        if len(endpoint) == 2:
            url, method = endpoint
            data = None
        else:
            url, method, data = endpoint
            
        result = test_endpoint(url, method, data)
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    # Test spécial pour l'endpoint de validation d'import
    try:
        import os
        test_file_path = "backend/test_loto_bonus.csv"
        if os.path.exists(test_file_path):
            with open(test_file_path, 'rb') as f:
                files = {'file': ('test.csv', f, 'text/csv')}
                data = {'type': 'loto'}
                response = requests.post(f"{BASE_URL}/api/import/validate", files=files, data=data, timeout=10)
            
            result = {
                "url": "/api/import/validate",
                "method": "POST",
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
                "error": None
            }
        else:
            result = {
                "url": "/api/import/validate",
                "method": "POST",
                "status_code": None,
                "success": False,
                "data": None,
                "error": "Fichier de test non trouvé"
            }
    except Exception as e:
        result = {
            "url": "/api/import/validate",
            "method": "POST",
            "status_code": None,
            "success": False,
            "data": None,
            "error": str(e)
        }
    
    results.append(result)
    status = "✅" if result["success"] else "❌"
    print(f"  {status} POST /api/import/validate - {result['status_code']}")
    if not result["success"] and result["error"]:
        print(f"    Erreur: {result['error']}")
    
    return results

def test_generator_endpoints() -> List[Dict]:
    """Teste les endpoints de génération"""
    print("\n🔍 Test des endpoints de génération...")
    
    # Test génération Loto
    loto_data = {
        "num_grids": 1,
        "strategy": "random"
    }
    
    euromillions_data = {
        "num_grids": 1,
        "strategy": "random"
    }
    
    endpoints = [
        ("/api/loto/generate", "POST", loto_data),
        ("/api/euromillions/generate", "POST", euromillions_data),
        ("/api/loto/advanced/generate-grid", "GET"),
        ("/api/euromillions/advanced/generate-grid", "GET"),
    ]
    
    results = []
    for endpoint in endpoints:
        if len(endpoint) == 2:
            url, method = endpoint
            data = None
        else:
            url, method, data = endpoint
            
        result = test_endpoint(url, method, data)
        results.append(result)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {method} {url} - {result['status_code']}")
        if not result["success"] and result["error"]:
            print(f"    Erreur: {result['error']}")
    
    return results

def analyze_results(all_results: List[Dict]) -> Dict[str, Any]:
    """Analyse les résultats des tests"""
    total_tests = len(all_results)
    successful_tests = sum(1 for r in all_results if r["success"])
    failed_tests = total_tests - successful_tests
    
    # Grouper par type d'endpoint
    endpoint_types = {}
    for result in all_results:
        url = result["url"]
        if "/loto/" in url:
            category = "Loto"
        elif "/euromillions/" in url:
            category = "Euromillions"
        elif "/history/" in url:
            category = "Historique"
        elif "/import/" in url:
            category = "Import"
        elif "/generate" in url:
            category = "Génération"
        else:
            category = "Commun"
        
        if category not in endpoint_types:
            endpoint_types[category] = {"total": 0, "success": 0, "failed": 0}
        
        endpoint_types[category]["total"] += 1
        if result["success"]:
            endpoint_types[category]["success"] += 1
        else:
            endpoint_types[category]["failed"] += 1
    
    return {
        "total_tests": total_tests,
        "successful_tests": successful_tests,
        "failed_tests": failed_tests,
        "success_rate": (successful_tests / total_tests * 100) if total_tests > 0 else 0,
        "endpoint_types": endpoint_types,
        "failed_endpoints": [r for r in all_results if not r["success"]]
    }

def main():
    """Fonction principale de test"""
    print("🚀 DÉBUT DU TEST COMPLET DE L'APPLICATION")
    print("=" * 50)
    
    # Attendre que le backend soit prêt
    print("⏳ Attente du démarrage du backend...")
    time.sleep(2)
    
    # Tests des endpoints
    loto_results = test_loto_endpoints()
    euromillions_results = test_euromillions_endpoints()
    common_results = test_common_endpoints()
    generator_results = test_generator_endpoints()
    
    # Combiner tous les résultats
    all_results = loto_results + euromillions_results + common_results + generator_results
    
    # Analyser les résultats
    analysis = analyze_results(all_results)
    
    # Afficher le rapport
    print("\n" + "=" * 50)
    print("📊 RAPPORT DE TEST COMPLET")
    print("=" * 50)
    
    print(f"Total des tests: {analysis['total_tests']}")
    print(f"Tests réussis: {analysis['successful_tests']}")
    print(f"Tests échoués: {analysis['failed_tests']}")
    print(f"Taux de succès: {analysis['success_rate']:.1f}%")
    
    print("\n📈 Répartition par catégorie:")
    for category, stats in analysis["endpoint_types"].items():
        success_rate = (stats["success"] / stats["total"] * 100) if stats["total"] > 0 else 0
        print(f"  {category}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
    
    if analysis["failed_endpoints"]:
        print("\n❌ Endpoints en échec:")
        for endpoint in analysis["failed_endpoints"]:
            print(f"  {endpoint['method']} {endpoint['url']}")
            if endpoint["error"]:
                print(f"    Erreur: {endpoint['error']}")
    
    # Sauvegarder le rapport
    with open("rapport_test_complet.json", "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Rapport sauvegardé dans 'rapport_test_complet.json'")
    
    return analysis

if __name__ == "__main__":
    main() 