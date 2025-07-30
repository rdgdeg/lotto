from supabase import create_client
from ..config import settings

# Créer le client Supabase
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

def test_connection():
    """Teste la connexion à Supabase"""
    try:
        # Test simple de connexion
        response = supabase.table('draws_euromillions').select('count', count='exact').execute()
        return True
    except Exception as e:
        print(f"Erreur de connexion Supabase : {e}")
        return False

def get_table_info():
    """Récupère les informations sur les tables"""
    try:
        # Récupérer les informations sur les tables
        tables = ['draws_euromillions', 'draws_loto', 'stats']
        info = {}
        
        for table in tables:
            try:
                response = supabase.table(table).select('count', count='exact').execute()
                info[table] = response.count
            except:
                info[table] = 0
        
        return info
    except Exception as e:
        print(f"Erreur lors de la récupération des infos : {e}")
        return {} 