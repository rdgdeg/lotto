#!/usr/bin/env python3
"""
Validateur amélioré pour les uploads de fichiers CSV de tirages Loto
Plus flexible avec les formats de colonnes
"""

import csv
import sqlite3
import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import os

class EnhancedUploadValidator:
    """Validateur amélioré pour les uploads de fichiers CSV de tirages"""
    
    def __init__(self, db_path: str = './lotto.db'):
        self.db_path = db_path
        
    def validate_csv_file(self, file_path: str, game_type: str) -> Dict:
        """
        Valide un fichier CSV avant upload avec détection automatique du format
        
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
            'summary': {},
            'format_detected': None
        }
        
        try:
            # Détecter le format du fichier
            format_info = self._detect_file_format(file_path, game_type)
            if not format_info['valid']:
                result['errors'].extend(format_info['errors'])
                return result
            
            result['format_detected'] = format_info['mapping']
            
            # Lire le fichier avec le format détecté
            df = pd.read_csv(file_path, encoding=format_info.get('encoding', 'utf-8'), sep=format_info.get('separator', ','))
            
            # Analyser chaque ligne
            valid_rows = []
            invalid_rows = []
            
            for index, row in df.iterrows():
                row_number = index + 2  # +2 car on commence à 1 et on a sauté l'en-tête
                row_validation = self._validate_row_enhanced(row, game_type, row_number, format_info['mapping'])
                
                if row_validation['valid']:
                    valid_rows.append(row)
                else:
                    invalid_rows.append(row)
                    result['errors'].extend(row_validation['errors'])
                
                # Ajouter les warnings de la ligne
                if 'warnings' in row_validation:
                    result['warnings'].extend(row_validation['warnings'])
            
            result['total_rows'] = len(df)
            result['valid_rows'] = len(valid_rows)
            result['invalid_rows'] = len(invalid_rows)
            
            # Vérifier les doublons potentiels
            if valid_rows:
                duplicates = self._check_duplicates_enhanced(valid_rows, game_type, format_info['mapping'])
                result['duplicates'] = duplicates
                
                if duplicates > 0:
                    result['warnings'].append(f"{duplicates} tirages potentiellement en doublon détectés")
            
            # Analyser la plage de dates
            if valid_rows:
                dates = []
                for row in valid_rows:
                    date_str = str(row[format_info['mapping']['date']])
                    try:
                        # Essayer différents formats de date
                        parsed_date = self._parse_date_flexible(date_str)
                        if parsed_date:
                            dates.append(parsed_date)
                    except:
                        pass
                
                if dates:
                    result['date_range']['min'] = min(dates).strftime('%Y-%m-%d')
                    result['date_range']['max'] = max(dates).strftime('%Y-%m-%d')
            
            # Générer un résumé
            result['summary'] = self._generate_summary_enhanced(valid_rows, game_type, format_info['mapping'])
            
            # Le fichier est valide s'il n'y a pas d'erreurs critiques
            result['valid'] = len(result['errors']) == 0
            
        except Exception as e:
            result['errors'].append(f"Erreur lors de la lecture du fichier: {str(e)}")
        
        return result
    
    def _detect_file_format(self, file_path: str, game_type: str) -> Dict:
        """Détecte automatiquement le format du fichier"""
        result = {
            'valid': False,
            'mapping': {},
            'encoding': 'utf-8',
            'errors': []
        }
        
        # Essayer différents encodages
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        # Détecter le séparateur et l'encodage
        separators = [',', ';', '\t']
        
        for encoding in encodings:
            for sep in separators:
                try:
                    df = pd.read_csv(file_path, encoding=encoding, sep=sep, nrows=1)
                    # Vérifier que les colonnes sont bien séparées
                    if len(df.columns) > 1:
                        result['encoding'] = encoding
                        result['separator'] = sep
                        break
                except UnicodeDecodeError:
                    continue
                except Exception:
                    continue
            else:
                continue
            break
        else:
            result['errors'].append("Impossible de lire le fichier avec les encodages et séparateurs testés")
            return result
        
        # Colonnes possibles pour Loto
        if game_type == 'loto':
            possible_columns = {
                'date': ['Date', 'date', 'DATE', 'DRAW_DATE', 'TIRAGE_DATE', 'Jour', 'jour'],
                'numero1': ['Numéro 1', 'Numero 1', 'numero 1', 'N1', 'n1', 'BALL1', 'ball1', 'Boule 1', 'boule 1', 'Numéro1', 'Numero1'],
                'numero2': ['Numéro 2', 'Numero 2', 'numero 2', 'N2', 'n2', 'BALL2', 'ball2', 'Boule 2', 'boule 2', 'Numéro2', 'Numero2'],
                'numero3': ['Numéro 3', 'Numero 3', 'numero 3', 'N3', 'n3', 'BALL3', 'ball3', 'Boule 3', 'boule 3', 'Numéro3', 'Numero3'],
                'numero4': ['Numéro 4', 'Numero 4', 'numero 4', 'N4', 'n4', 'BALL4', 'ball4', 'Boule 4', 'boule 4', 'Numéro4', 'Numero4'],
                'numero5': ['Numéro 5', 'Numero 5', 'numero 5', 'N5', 'n5', 'BALL5', 'ball5', 'Boule 5', 'boule 5', 'Numéro5', 'Numero5'],
                'numero6': ['Numéro 6', 'Numero 6', 'numero 6', 'N6', 'n6', 'BALL6', 'ball6', 'Boule 6', 'boule 6', 'Numéro6', 'Numero6'],
                'complementaire': ['Complémentaire', 'Complementaire', 'complementaire', 'Bonus', 'bonus', 'BONUS', 'COMPLEMENTAIRE', 'Chance', 'chance', 'COMPLEMENTAIRE']
            }
        
        # Détecter les colonnes
        mapping = {}
        missing_columns = []
        
        for expected_key, possible_names in possible_columns.items():
            found = False
            for possible_name in possible_names:
                if possible_name in df.columns:
                    mapping[expected_key] = possible_name
                    found = True
                    break
            
            if not found:
                missing_columns.append(expected_key)
        
        if missing_columns:
            result['errors'].append(f"Colonnes manquantes: {', '.join(missing_columns)}")
            result['errors'].append(f"Colonnes trouvées: {', '.join(df.columns)}")
        else:
            result['valid'] = True
            result['mapping'] = mapping
        
        return result
    
    def _parse_date_flexible(self, date_str: str) -> Optional[datetime]:
        """Parse une date avec plusieurs formats possibles"""
        date_formats = [
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%d/%m/%y',
            '%d-%m-%Y',
            '%d-%m-%y',
            '%Y/%m/%d',
            '%d.%m.%Y',
            '%d.%m.%y'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        
        return None
    
    def _validate_row_enhanced(self, row: pd.Series, game_type: str, row_number: int, mapping: Dict) -> Dict:
        """Valide une ligne avec le mapping détecté"""
        result = {'valid': True, 'errors': [], 'warnings': []}
        
        try:
            # Valider la date
            date_str = str(row[mapping['date']]).strip()
            if not date_str or date_str == 'nan':
                result['errors'].append(f"Ligne {row_number}: Date manquante")
                result['valid'] = False
            else:
                parsed_date = self._parse_date_flexible(date_str)
                if not parsed_date:
                    result['errors'].append(f"Ligne {row_number}: Format de date invalide ({date_str})")
                    result['valid'] = False
                elif parsed_date > datetime.now():
                    result['errors'].append(f"Ligne {row_number}: Date dans le futur ({date_str})")
                    result['valid'] = False
            
            # Valider les numéros selon le type de jeu
            if game_type == 'loto':
                self._validate_loto_numbers_enhanced(row, row_number, result, mapping)
                
        except Exception as e:
            result['errors'].append(f"Ligne {row_number}: Erreur de validation - {str(e)}")
            result['valid'] = False
        
        return result
    
    def _validate_loto_numbers_enhanced(self, row: pd.Series, row_number: int, result: Dict, mapping: Dict):
        """Valide les numéros pour Loto avec mapping flexible"""
        numbers = []
        
        # Valider les 6 numéros principaux (1-45)
        for i in range(1, 7):
            num_key = mapping[f'numero{i}']
            try:
                num = int(row[num_key])
                if num < 1 or num > 45:
                    result['errors'].append(f"Ligne {row_number}: {num_key} doit être entre 1 et 45 (valeur: {num})")
                    result['valid'] = False
                numbers.append(num)
            except (ValueError, TypeError):
                result['errors'].append(f"Ligne {row_number}: {num_key} invalide")
                result['valid'] = False
        
        # Valider le numéro bonus (1-45 pour le Lotto)
        complementaire_key = mapping['complementaire']
        try:
            complementaire = int(row[complementaire_key])
            # Le numéro bonus du Lotto est tiré dans la plage 1-45
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
    
    def _check_duplicates_enhanced(self, valid_rows: List[pd.Series], game_type: str, mapping: Dict) -> int:
        """Vérifie les doublons avec mapping flexible"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        duplicates = 0
        
        try:
            for row in valid_rows:
                date_str = str(row[mapping['date']])
                parsed_date = self._parse_date_flexible(date_str)
                if not parsed_date:
                    continue
                
                date_formatted = parsed_date.strftime('%Y-%m-%d')
                
                if game_type == 'loto':
                    cursor.execute("""
                        SELECT COUNT(*) FROM draws_loto 
                        WHERE date = ? AND n1 = ? AND n2 = ? AND n3 = ? AND n4 = ? AND n5 = ? AND n6 = ? AND complementaire = ?
                    """, (
                        date_formatted,
                        int(row[mapping['numero1']]), int(row[mapping['numero2']]), int(row[mapping['numero3']]),
                        int(row[mapping['numero4']]), int(row[mapping['numero5']]), int(row[mapping['numero6']]),
                        int(row[mapping['complementaire']])
                    ))
                
                if cursor.fetchone()[0] > 0:
                    duplicates += 1
                    
        except Exception as e:
            print(f"Erreur lors de la vérification des doublons: {e}")
        finally:
            conn.close()
        
        return duplicates
    
    def _generate_summary_enhanced(self, valid_rows: List[pd.Series], game_type: str, mapping: Dict) -> Dict:
        """Génère un résumé avec mapping flexible"""
        if not valid_rows:
            return {}
        
        # Compter par année
        years = {}
        for row in valid_rows:
            date_str = str(row[mapping['date']])
            parsed_date = self._parse_date_flexible(date_str)
            if parsed_date:
                year = str(parsed_date.year)
                years[year] = years.get(year, 0) + 1
        
        return {
            'total_draws': len(valid_rows),
            'years_covered': len(years),
            'yearly_breakdown': years
        }

def print_enhanced_validation_report(validation_result: Dict, file_path: str):
    """Affiche un rapport de validation amélioré"""
    print(f"\n📊 Rapport de validation pour: {file_path}")
    print("=" * 60)
    
    if validation_result['format_detected']:
        print(f"🎯 Format détecté:")
        for key, value in validation_result['format_detected'].items():
            print(f"  {key}: '{value}'")
    
    print(f"📈 Résultats:")
    print(f"  Total lignes: {validation_result['total_rows']}")
    print(f"  Lignes valides: {validation_result['valid_rows']}")
    print(f"  Lignes invalides: {validation_result['invalid_rows']}")
    print(f"  Doublons détectés: {validation_result['duplicates']}")
    
    if validation_result['date_range']['min']:
        print(f"  Période: {validation_result['date_range']['min']} à {validation_result['date_range']['max']}")
    
    if validation_result['errors']:
        print(f"\n❌ Erreurs:")
        for error in validation_result['errors']:
            print(f"  • {error}")
    
    if validation_result['warnings']:
        print(f"\n⚠️ Avertissements:")
        for warning in validation_result['warnings']:
            print(f"  • {warning}")
    
    if validation_result['valid']:
        print(f"\n✅ Fichier valide pour l'import !")
    else:
        print(f"\n❌ Fichier invalide - Correction nécessaire")

if __name__ == "__main__":
    # Test du validateur amélioré
    validator = EnhancedUploadValidator()
    
    # Demander le fichier à tester
    file_path = input("📁 Chemin vers le fichier CSV à valider: ").strip()
    
    if not os.path.exists(file_path):
        print(f"❌ Fichier non trouvé: {file_path}")
    else:
        result = validator.validate_csv_file(file_path, 'loto')
        print_enhanced_validation_report(result, file_path) 