#!/usr/bin/env python3
"""
Système de validation pour les uploads de fichiers CSV de tirages.
"""

import csv
import sqlite3
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class UploadValidator:
    """Classe pour valider les uploads de fichiers CSV de tirages"""
    
    def __init__(self, db_path: str = './lotto.db'):
        self.db_path = db_path
        
    def validate_csv_file(self, file_path: str, game_type: str) -> Dict:
        """
        Valide un fichier CSV avant upload
        
        Args:
            file_path: Chemin vers le fichier CSV
            game_type: 'euromillions' ou 'loto'
            
        Returns:
            Dict avec les résultats de validation
        """
        result = {
            'valid': False,
            'total_rows': 0,
            'valid_rows': 0,
            'invalid_rows': 0,
            'errors': [],
            'warnings': [],
            'duplicates': 0,
            'date_range': {'min': None, 'max': None},
            'summary': {}
        }
        
        try:
            # Lire le fichier CSV
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                # Vérifier les colonnes requises
                columns_valid, missing_columns = self._check_required_columns(reader.fieldnames, game_type)
                
                if not columns_valid:
                    result['errors'].append(f"Colonnes manquantes: {', '.join(missing_columns)}")
                    return result
                
                # Analyser chaque ligne
                row_number = 1  # Commencer à 1 car on a sauté l'en-tête
                valid_rows = []
                invalid_rows = []
                
                for row in reader:
                    row_number += 1
                    row_validation = self._validate_row(row, game_type, row_number)
                    
                    if row_validation['valid']:
                        valid_rows.append(row)
                    else:
                        invalid_rows.append(row)
                        result['errors'].extend(row_validation['errors'])
                
                result['total_rows'] = row_number - 1  # Soustraire l'en-tête
                result['valid_rows'] = len(valid_rows)
                result['invalid_rows'] = len(invalid_rows)
                
                # Vérifier les doublons potentiels
                if valid_rows:
                    duplicates = self._check_duplicates(valid_rows, game_type)
                    result['duplicates'] = duplicates
                    
                    if duplicates > 0:
                        result['warnings'].append(f"{duplicates} tirages potentiellement en doublon détectés")
                
                # Analyser la plage de dates
                if valid_rows:
                    dates = [datetime.strptime(row['Date'], '%Y-%m-%d') for row in valid_rows]
                    result['date_range']['min'] = min(dates).strftime('%Y-%m-%d')
                    result['date_range']['max'] = max(dates).strftime('%Y-%m-%d')
                
                # Générer un résumé
                result['summary'] = self._generate_summary(valid_rows, game_type)
                
                # Le fichier est valide s'il n'y a pas d'erreurs critiques
                result['valid'] = len(result['errors']) == 0
                
        except Exception as e:
            result['errors'].append(f"Erreur lors de la lecture du fichier: {str(e)}")
        
        return result
    
    def _get_required_columns(self, game_type: str) -> List[str]:
        """Retourne les colonnes requises selon le type de jeu"""
        if game_type == 'euromillions':
            return ['Date', 'Numéro 1', 'Numéro 2', 'Numéro 3', 'Numéro 4', 'Numéro 5', 'Etoile 1', 'Etoile 2']
        elif game_type == 'loto':
            # Accepter soit 'Complémentaire' soit 'Bonus'
            return ['Date', 'Numéro 1', 'Numéro 2', 'Numéro 3', 'Numéro 4', 'Numéro 5', 'Numéro 6']
        else:
            raise ValueError(f"Type de jeu non supporté: {game_type}")
    
    def _check_required_columns(self, fieldnames: List[str], game_type: str) -> Tuple[bool, List[str]]:
        """Vérifie les colonnes requises avec gestion flexible pour Loto"""
        if game_type == 'loto':
            # Colonnes de base requises
            base_columns = ['Date', 'Numéro 1', 'Numéro 2', 'Numéro 3', 'Numéro 4', 'Numéro 5', 'Numéro 6']
            missing_base = [col for col in base_columns if col not in fieldnames]
            
            # Vérifier qu'on a soit 'Complémentaire' soit 'Bonus'
            has_complementaire = 'Complémentaire' in fieldnames
            has_bonus = 'Bonus' in fieldnames
            
            if missing_base:
                return False, missing_base
            
            if not has_complementaire and not has_bonus:
                return False, ['Complémentaire ou Bonus']
            
            return True, []
        else:
            # Pour Euromillions, validation stricte
            required_columns = self._get_required_columns(game_type)
            missing_columns = [col for col in required_columns if col not in fieldnames]
            return len(missing_columns) == 0, missing_columns
    
    def _validate_row(self, row: Dict, game_type: str, row_number: int) -> Dict:
        """Valide une ligne individuelle"""
        result = {'valid': True, 'errors': []}
        
        try:
            # Valider la date
            date_str = row.get('Date', '').strip()
            if not date_str:
                result['errors'].append(f"Ligne {row_number}: Date manquante")
                result['valid'] = False
            else:
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    # Vérifier que la date est raisonnable (pas dans le futur)
                    if date_obj > datetime.now():
                        result['warnings'].append(f"Ligne {row_number}: Date dans le futur ({date_str})")
                except ValueError:
                    result['errors'].append(f"Ligne {row_number}: Format de date invalide ({date_str})")
                    result['valid'] = False
            
            # Valider les numéros selon le type de jeu
            if game_type == 'euromillions':
                self._validate_euromillions_numbers(row, row_number, result)
            elif game_type == 'loto':
                self._validate_loto_numbers(row, row_number, result)
                
        except Exception as e:
            result['errors'].append(f"Ligne {row_number}: Erreur de validation - {str(e)}")
            result['valid'] = False
        
        return result
    
    def _validate_euromillions_numbers(self, row: Dict, row_number: int, result: Dict):
        """Valide les numéros pour Euromillions"""
        numbers = []
        stars = []
        
        # Valider les 5 numéros principaux (1-50)
        for i in range(1, 6):
            num_key = f'Numéro {i}'
            try:
                num = int(row.get(num_key, ''))
                if num < 1 or num > 50:
                    result['errors'].append(f"Ligne {row_number}: {num_key} doit être entre 1 et 50 (valeur: {num})")
                    result['valid'] = False
                numbers.append(num)
            except (ValueError, TypeError):
                result['errors'].append(f"Ligne {row_number}: {num_key} invalide")
                result['valid'] = False
        
        # Valider les 2 étoiles (1-12)
        for i in range(1, 3):
            star_key = f'Etoile {i}'
            try:
                star = int(row.get(star_key, ''))
                if star < 1 or star > 12:
                    result['errors'].append(f"Ligne {row_number}: {star_key} doit être entre 1 et 12 (valeur: {star})")
                    result['valid'] = False
                stars.append(star)
            except (ValueError, TypeError):
                result['errors'].append(f"Ligne {row_number}: {star_key} invalide")
                result['valid'] = False
        
        # Vérifier les doublons
        if len(set(numbers)) != 5:
            result['errors'].append(f"Ligne {row_number}: Numéros en doublon détectés")
            result['valid'] = False
        
        if len(set(stars)) != 2:
            result['errors'].append(f"Ligne {row_number}: Étoiles en doublon détectées")
            result['valid'] = False
    
    def _validate_loto_numbers(self, row: Dict, row_number: int, result: Dict):
        """Valide les numéros pour Loto"""
        numbers = []
        
        # Valider les 6 numéros principaux (1-45)
        for i in range(1, 7):
            num_key = f'Numéro {i}'
            try:
                num = int(row.get(num_key, ''))
                if num < 1 or num > 45:
                    result['errors'].append(f"Ligne {row_number}: {num_key} doit être entre 1 et 45 (valeur: {num})")
                    result['valid'] = False
                numbers.append(num)
            except (ValueError, TypeError):
                result['errors'].append(f"Ligne {row_number}: {num_key} invalide")
                result['valid'] = False
        
        # Valider le numéro complémentaire/bonus (1-10)
        complementaire_key = 'Complémentaire' if 'Complémentaire' in row else 'Bonus'
        try:
            complementaire = int(row.get(complementaire_key, ''))
            if complementaire < 1 or complementaire > 10:
                result['errors'].append(f"Ligne {row_number}: {complementaire_key} doit être entre 1 et 10 (valeur: {complementaire})")
                result['valid'] = False
        except (ValueError, TypeError):
            result['errors'].append(f"Ligne {row_number}: {complementaire_key} invalide")
            result['valid'] = False
        
        # Vérifier les doublons
        if len(set(numbers)) != 6:
            result['errors'].append(f"Ligne {row_number}: Numéros en doublon détectés")
            result['valid'] = False
    
    def _check_duplicates(self, valid_rows: List[Dict], game_type: str) -> int:
        """Vérifie les doublons potentiels avec la base de données"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        duplicates = 0
        
        try:
            for row in valid_rows:
                date_str = row['Date']
                
                if game_type == 'euromillions':
                    cursor.execute("""
                        SELECT COUNT(*) FROM draws_euromillions 
                        WHERE date = ? AND n1 = ? AND n2 = ? AND n3 = ? AND n4 = ? AND n5 = ? AND e1 = ? AND e2 = ?
                    """, (
                        date_str,
                        int(row['Numéro 1']), int(row['Numéro 2']), int(row['Numéro 3']),
                        int(row['Numéro 4']), int(row['Numéro 5']),
                        int(row['Etoile 1']), int(row['Etoile 2'])
                    ))
                elif game_type == 'loto':
                    # Gérer les deux formats possibles pour le complémentaire/bonus
                    complementaire_key = 'Complémentaire' if 'Complémentaire' in row else 'Bonus'
                    
                    cursor.execute("""
                        SELECT COUNT(*) FROM draws_loto 
                        WHERE date = ? AND n1 = ? AND n2 = ? AND n3 = ? AND n4 = ? AND n5 = ? AND n6 = ? AND complementaire = ?
                    """, (
                        date_str,
                        int(row['Numéro 1']), int(row['Numéro 2']), int(row['Numéro 3']),
                        int(row['Numéro 4']), int(row['Numéro 5']), int(row['Numéro 6']),
                        int(row[complementaire_key])
                    ))
                
                if cursor.fetchone()[0] > 0:
                    duplicates += 1
                    
        except Exception as e:
            print(f"Erreur lors de la vérification des doublons: {e}")
        finally:
            conn.close()
        
        return duplicates
    
    def _generate_summary(self, valid_rows: List[Dict], game_type: str) -> Dict:
        """Génère un résumé des données valides"""
        if not valid_rows:
            return {}
        
        # Compter par année
        years = {}
        for row in valid_rows:
            year = row['Date'][:4]
            years[year] = years.get(year, 0) + 1
        
        return {
            'total_draws': len(valid_rows),
            'years_covered': len(years),
            'yearly_breakdown': years,
            'date_range': {
                'min': min(row['Date'] for row in valid_rows),
                'max': max(row['Date'] for row in valid_rows)
            }
        }

def print_validation_report(validation_result: Dict, file_path: str):
    """Affiche un rapport de validation formaté"""
    print("=" * 60)
    print(f"📋 RAPPORT DE VALIDATION - {file_path}")
    print("=" * 60)
    
    print(f"\n📊 STATISTIQUES:")
    print(f"   • Total de lignes: {validation_result['total_rows']}")
    print(f"   • Lignes valides: {validation_result['valid_rows']}")
    print(f"   • Lignes invalides: {validation_result['invalid_rows']}")
    print(f"   • Doublons potentiels: {validation_result['duplicates']}")
    
    if validation_result['date_range']['min']:
        print(f"   • Période: {validation_result['date_range']['min']} à {validation_result['date_range']['max']}")
    
    if validation_result['summary']:
        print(f"\n📅 RÉSUMÉ:")
        summary = validation_result['summary']
        print(f"   • Total tirages: {summary['total_draws']}")
        print(f"   • Années couvertes: {summary['years_covered']}")
        print(f"   • Répartition par année:")
        for year, count in sorted(summary['yearly_breakdown'].items()):
            print(f"     - {year}: {count} tirages")
    
    if validation_result['warnings']:
        print(f"\n⚠️ AVERTISSEMENTS ({len(validation_result['warnings'])}):")
        for warning in validation_result['warnings']:
            print(f"   • {warning}")
    
    if validation_result['errors']:
        print(f"\n❌ ERREURS ({len(validation_result['errors'])}):")
        for error in validation_result['errors'][:10]:  # Limiter à 10 erreurs
            print(f"   • {error}")
        if len(validation_result['errors']) > 10:
            print(f"   ... et {len(validation_result['errors']) - 10} autres erreurs")
    
    print(f"\n🎯 RÉSULTAT: {'✅ VALIDE' if validation_result['valid'] else '❌ INVALIDE'}")
    print("=" * 60)

if __name__ == "__main__":
    # Exemple d'utilisation
    validator = UploadValidator()
    
    # Tester avec le fichier existant
    result = validator.validate_csv_file('./euromillions_test_data.csv', 'euromillions')
    print_validation_report(result, './euromillions_test_data.csv') 