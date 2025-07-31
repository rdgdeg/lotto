import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

class Settings:
    # Configuration Supabase - Utiliser uniquement les variables d'environnement
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
    
    # URL de connexion - Utiliser SQLite en local pour le développement
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./lotto.db"  # Base de données SQLite locale
    )
    
    # Configuration de l'application
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))

settings = Settings() 