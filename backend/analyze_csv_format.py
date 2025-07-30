#!/usr/bin/env python3
"""
Script pour analyser et corriger automatiquement les formats CSV de Loto
"""

import pandas as pd
import csv
import os
import sys
from pathlib import Path

def analyze_csv_file(file_path):
    """Analyse un fichier CSV et affiche ses informations"""
    print(f"\n🔍 Analyse du fichier: {file_path}")
    print("=" * 50)
    
    try:
        # Essayer différents encodages
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(file_path, encoding=encoding, nrows=5)
                print(f"✅ Encodage détecté: {encoding}")
                break
            except UnicodeDecodeError:
                continue
        
        if df is None:
            print("❌ Impossible de lire le fichier avec les encodages testés")
            return None
        
        # Afficher les informations du fichier
        print(f"📊 Colonnes trouvées ({len(df.columns)}):")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. '{col}'")
        
        print(f"\n📋 Premières lignes:")
        print(df.head())
        
        # Analyser les types de données
        print(f"\n🔧 Types de données:")
        for col in df.columns:
            sample_values = df[col].dropna().head(3).tolist()
            print(f"  {col}: {sample_values}")
        
        return df
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        return None

def detect_loto_format(df):
    """Détecte le format Loto dans le DataFrame"""
    print(f"\n🎯 Détection du format Loto:")
    
    # Colonnes attendues pour Loto
    expected_columns = {
        'date': ['Date', 'date', 'DATE', 'DRAW_DATE', 'TIRAGE_DATE'],
        'numero1': ['Numéro 1', 'Numero 1', 'numero 1', 'N1', 'n1', 'BALL1', 'ball1'],
        'numero2': ['Numéro 2', 'Numero 2', 'numero 2', 'N2', 'n2', 'BALL2', 'ball2'],
        'numero3': ['Numéro 3', 'Numero 3', 'numero 3', 'N3', 'n3', 'BALL3', 'ball3'],
        'numero4': ['Numéro 4', 'Numero 4', 'numero 4', 'N4', 'n4', 'BALL4', 'ball4'],
        'numero5': ['Numéro 5', 'Numero 5', 'numero 5', 'N5', 'n5', 'BALL5', 'ball5'],
        'numero6': ['Numéro 6', 'Numero 6', 'numero 6', 'N6', 'n6', 'BALL6', 'ball6'],
        'complementaire': ['Complémentaire', 'Complementaire', 'complementaire', 'Bonus', 'bonus', 'BONUS', 'COMPLEMENTAIRE']
    }
    
    mapping = {}
    missing_columns = []
    
    for expected_key, possible_names in expected_columns.items():
        found = False
        for possible_name in possible_names:
            if possible_name in df.columns:
                mapping[expected_key] = possible_name
                found = True
                break
        
        if not found:
            missing_columns.append(expected_key)
    
    print(f"✅ Colonnes détectées:")
    for key, value in mapping.items():
        print(f"  {key}: '{value}'")
    
    if missing_columns:
        print(f"❌ Colonnes manquantes: {missing_columns}")
    
    return mapping, missing_columns

def convert_to_standard_format(input_file, output_file, mapping):
    """Convertit le fichier au format standard"""
    print(f"\n🔄 Conversion vers le format standard...")
    
    try:
        # Lire le fichier original
        df = pd.read_csv(input_file)
        
        # Créer un nouveau DataFrame avec les colonnes standard
        new_df = pd.DataFrame()
        
        # Mapper les colonnes
        new_df['Date'] = df[mapping['date']]
        new_df['Numéro 1'] = df[mapping['numero1']]
        new_df['Numéro 2'] = df[mapping['numero2']]
        new_df['Numéro 3'] = df[mapping['numero3']]
        new_df['Numéro 4'] = df[mapping['numero4']]
        new_df['Numéro 5'] = df[mapping['numero5']]
        new_df['Numéro 6'] = df[mapping['numero6']]
        new_df['Complémentaire'] = df[mapping['complementaire']]
        
        # Sauvegarder le fichier converti
        new_df.to_csv(output_file, index=False)
        
        print(f"✅ Fichier converti sauvegardé: {output_file}")
        print(f"📊 Aperçu du fichier converti:")
        print(new_df.head())
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la conversion: {e}")
        return False

def main():
    """Fonction principale"""
    print("🔧 Analyseur de formats CSV Loto")
    print("=" * 50)
    
    # Demander le chemin du fichier
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = input("📁 Chemin vers le fichier CSV: ").strip()
    
    if not os.path.exists(file_path):
        print(f"❌ Fichier non trouvé: {file_path}")
        return
    
    # Analyser le fichier
    df = analyze_csv_file(file_path)
    if df is None:
        return
    
    # Détecter le format
    mapping, missing_columns = detect_loto_format(df)
    
    if missing_columns:
        print(f"\n❌ Format non reconnu. Colonnes manquantes: {missing_columns}")
        print("💡 Vérifiez que votre fichier contient bien les colonnes de tirage Loto")
        return
    
    # Proposer la conversion
    print(f"\n✅ Format Loto détecté !")
    output_file = file_path.replace('.csv', '_converted.csv')
    
    convert = input(f"🔄 Convertir vers le format standard ? (y/n): ").strip().lower()
    if convert in ['y', 'yes', 'o', 'oui']:
        success = convert_to_standard_format(file_path, output_file, mapping)
        if success:
            print(f"\n🎯 Votre fichier est maintenant prêt pour l'import !")
            print(f"📁 Fichier converti: {output_file}")
            print(f"📁 Fichier original: {file_path}")
        else:
            print(f"\n❌ Échec de la conversion")

if __name__ == "__main__":
    main() 