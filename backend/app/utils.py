import pandas as pd
from typing import List, Dict
from datetime import datetime

def parse_euromillions_csv(file_path: str) -> List[Dict]:
    try:
        # Essayer d'abord avec le séparateur par défaut (virgule)
        try:
            df = pd.read_csv(file_path)
            # Vérifier si les colonnes sont correctement séparées
            if len(df.columns) == 1 and ';' in str(df.columns[0]):
                # Si une seule colonne avec des points-virgules, utiliser le point-virgule comme séparateur
                df = pd.read_csv(file_path, sep=';')
        except Exception:
            # Si ça échoue, essayer avec le point-virgule
            df = pd.read_csv(file_path, sep=';')
        
        print(f"Colonnes trouvées dans le CSV: {list(df.columns)}")
        print(f"Premières lignes du CSV:")
        print(df.head())
        
        draws = []
        for _, row in df.iterrows():
            # Gérer le format de date spécifique
            date_str = row['Date']
            if isinstance(date_str, str):
                # Extraire juste la date (YYYY-MM-DD) du format complet
                date_part = date_str.split(' ')[0]
                try:
                    parsed_date = datetime.strptime(date_part, '%Y-%m-%d').date()
                except ValueError:
                    # Si le format ne correspond pas, essayer d'autres formats
                    parsed_date = pd.to_datetime(date_str).date()
            else:
                parsed_date = pd.to_datetime(date_str).date()
            
            draws.append({
                'date': parsed_date,
                'n1': int(row['Numéro 1']), 
                'n2': int(row['Numéro 2']), 
                'n3': int(row['Numéro 3']), 
                'n4': int(row['Numéro 4']), 
                'n5': int(row['Numéro 5']),
                'e1': int(row['Etoile 1']), 
                'e2': int(row['Etoile 2'])
            })
        return draws
    except Exception as e:
        print(f"Erreur lors du parsing du fichier CSV: {e}")
        print(f"Colonnes disponibles: {list(df.columns) if 'df' in locals() else 'Aucune'}")
        raise e

def parse_loto_csv(file_path: str) -> List[Dict]:
    try:
        # Essayer d'abord avec le séparateur par défaut (virgule)
        try:
            df = pd.read_csv(file_path)
            # Vérifier si les colonnes sont correctement séparées
            if len(df.columns) == 1 and ';' in str(df.columns[0]):
                # Si une seule colonne avec des points-virgules, utiliser le point-virgule comme séparateur
                df = pd.read_csv(file_path, sep=';')
        except Exception:
            # Si ça échoue, essayer avec le point-virgule
            df = pd.read_csv(file_path, sep=';')
    
        print(f"Colonnes trouvées dans le CSV Loto: {list(df.columns)}")
        print(f"Premières lignes du CSV Loto:")
        print(df.head())
    
        draws = []
        for _, row in df.iterrows():
            # Gérer le format de date spécifique
            date_str = row['Date']
            if isinstance(date_str, str):
                # Extraire juste la date (YYYY-MM-DD) du format complet
                date_part = date_str.split(' ')[0]
                try:
                    parsed_date = datetime.strptime(date_part, '%Y-%m-%d').date()
                except ValueError:
                    # Si le format ne correspond pas, essayer d'autres formats
                    parsed_date = pd.to_datetime(date_str).date()
            else:
                parsed_date = pd.to_datetime(date_str).date()
            
            # Gérer les deux formats possibles pour le complémentaire/bonus
            complementaire_key = 'Complémentaire' if 'Complémentaire' in row else 'Bonus'
            
            draws.append({
                'date': parsed_date,
                'n1': int(row['Numéro 1']), 
                'n2': int(row['Numéro 2']), 
                'n3': int(row['Numéro 3']), 
                'n4': int(row['Numéro 4']), 
                'n5': int(row['Numéro 5']),
                'n6': int(row['Numéro 6']),
                'complementaire': int(row[complementaire_key])
            })
        return draws
    except Exception as e:
        print(f"Erreur lors du parsing du fichier Loto CSV: {e}")
        print(f"Colonnes disponibles: {list(df.columns) if 'df' in locals() else 'Aucune'}")
        raise e

def parse_stats_csv(file_path: str, jeu: str) -> List[Dict]:
    try:
        # Essayer d'abord avec le séparateur par défaut (virgule)
        try:
            df = pd.read_csv(file_path)
            # Vérifier si les colonnes sont correctement séparées
            if len(df.columns) == 1 and ';' in str(df.columns[0]):
                # Si une seule colonne avec des points-virgules, utiliser le point-virgule comme séparateur
                df = pd.read_csv(file_path, sep=';')
        except Exception:
            # Si ça échoue, essayer avec le point-virgule
            df = pd.read_csv(file_path, sep=';')
    
        stats = []
        for _, row in df.iterrows():
            stats.append({
                'jeu': jeu,
                'numero': row['numero'],
                'type': row['type'],
                'frequence': row['frequence'],
                'periode': row.get('periode', None)
            })
        return stats
    except Exception as e:
        print(f"Erreur lors du parsing du fichier Stats CSV: {e}")
        raise e 