from supabase import create_client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings

# Configuration Supabase
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
SUPABASE_SECRET_KEY = settings.SUPABASE_SECRET_KEY

# Créer le client Supabase (approche principale)
try:
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        SUPABASE_AVAILABLE = True
    else:
        print("⚠️ Variables Supabase non configurées, utilisation de SQLite uniquement")
        supabase = None
        SUPABASE_AVAILABLE = False
except Exception as e:
    print(f"❌ Erreur de connexion Supabase: {e}")
    supabase = None
    SUPABASE_AVAILABLE = False

# URL de connexion depuis la configuration
DATABASE_URL = settings.DATABASE_URL

# Créer l'engine SQLAlchemy
try:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    SQLALCHEMY_AVAILABLE = True
    print(f"✅ Connexion à la base de données établie: {DATABASE_URL}")
except Exception as e:
    print(f"❌ Erreur de connexion à la base de données: {e}")
    SQLALCHEMY_AVAILABLE = False
    engine = None
    SessionLocal = None

def get_db():
    """Fonction pour obtenir une session de base de données"""
    if SQLALCHEMY_AVAILABLE:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    elif SUPABASE_AVAILABLE and supabase:
        # Fallback vers Supabase client
        yield supabase
    else:
        # Fallback vers une session vide
        yield None 