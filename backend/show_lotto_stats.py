#!/usr/bin/env python3
"""
Script pour afficher un résumé détaillé des statistiques du Loto
"""

import requests
import json

def show_lotto_stats():
    """Affiche un résumé détaillé des statistiques du Loto"""
    print("📊 Statistiques détaillées du Loto français")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    try:
        # Récupérer les statistiques rapides
        response = requests.get(f"{base_url}/api/loto/quick-stats")
        data = response.json()
        
        print(f"\n🎯 Résumé général:")
        print(f"  Total tirages: {data['total_draws']:,}")
        
        # Période
        dates = [n['last_appearance'] for n in data['numbers'] if n['last_appearance']]
        if dates:
            print(f"  Période: {min(dates)} à {max(dates)}")
        
        # Top 10 numéros
        numbers = [n for n in data['numbers'] if n['count'] > 0]
        numbers.sort(key=lambda x: x['count'], reverse=True)
        
        print(f"\n🏆 Top 10 numéros les plus fréquents:")
        for i, num in enumerate(numbers[:10], 1):
            print(f"  {i:2d}. Numéro {num['numero']:2d}: {num['count']:4d} fois ({num['percentage']:5.1f}%)")
        
        # Top 10 numéros les moins fréquents
        numbers.sort(key=lambda x: x['count'])
        print(f"\n🔻 Top 10 numéros les moins fréquents:")
        for i, num in enumerate(numbers[:10], 1):
            print(f"  {i:2d}. Numéro {num['numero']:2d}: {num['count']:4d} fois ({num['percentage']:5.1f}%)")
        
        # Statistiques des complémentaires
        complementaires = [c for c in data['complementaires'] if c['count'] > 0]
        complementaires.sort(key=lambda x: x['count'], reverse=True)
        
        print(f"\n🍀 Top 5 complémentaires les plus fréquents:")
        for i, comp in enumerate(complementaires[:5], 1):
            print(f"  {i}. Bonus {comp['numero']:2d}: {comp['count']:4d} fois ({comp['percentage']:5.1f}%)")
        
        # Récupérer les analyses avancées
        print(f"\n📈 Analyses avancées:")
        response = requests.get(f"{base_url}/api/loto/advanced/comprehensive-stats")
        advanced_data = response.json()
        
        if 'error' not in advanced_data:
            basic_stats = advanced_data.get('basic_stats', {})
            print(f"  Numéro le plus fréquent: {basic_stats.get('most_frequent_number', 'N/A')}")
            print(f"  Numéro le moins fréquent: {basic_stats.get('least_frequent_number', 'N/A')}")
            print(f"  Somme moyenne: {basic_stats.get('average_sum', 'N/A')}")
            print(f"  Nombre de tirages avec consécutifs: {basic_stats.get('consecutive_draws', 'N/A')}")
        
        # Récupérer les années disponibles
        response = requests.get(f"{base_url}/api/loto/years")
        years_data = response.json()
        years = years_data.get('years', [])
        
        print(f"\n📅 Années disponibles: {len(years)}")
        if years:
            print(f"  Période: {min(years)} - {max(years)}")
            print(f"  Années: {', '.join(map(str, sorted(years)))}")
        
        print(f"\n✅ Statistiques mises à jour avec succès!")
        print(f"💡 Vous pouvez maintenant consulter les statistiques dans l'interface web.")
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des statistiques: {e}")

if __name__ == "__main__":
    show_lotto_stats() 