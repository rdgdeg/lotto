import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

class Settings:
    # Configuration Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://njmwuyirykeywdiwcgtv.supabase.co")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbXd1eWlyeWtleXdkaXdjZ3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODU2MjcsImV4cCI6MjA2OTM2MTYyN30.XEKenw1qwdWC_Guj5dWcfn0OT2pZfrZIQu_gg41bnek")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbXd1eWlyeWtleXdkaXdjZ3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NTYyNywiZXhwIjoyMDY5MzYxNjI3fQ.IA3K80b_Ozff3_yHcNHXXC8fM8XnNKVEw4A4lbUjekI")
    
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