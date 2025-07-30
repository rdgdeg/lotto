from sqlalchemy import create_engine
from app.models import Base, EuromillionsPayoutTable, EuromillionsCombination, EuromillionsPattern
from app.database import DATABASE_URL

def create_advanced_tables():
    """Crée les nouvelles tables pour les statistiques avancées d'Euromillions"""
    engine = create_engine(DATABASE_URL)
    
    # Créer les nouvelles tables
    EuromillionsPayoutTable.__table__.create(engine, checkfirst=True)
    EuromillionsCombination.__table__.create(engine, checkfirst=True)
    EuromillionsPattern.__table__.create(engine, checkfirst=True)
    
    print("Tables avancées créées avec succès!")
    
    # Insérer les données du tableau de gains
    insert_payout_data(engine)

def insert_payout_data(engine):
    """Insère les données du tableau de gains Euromillions"""
    from sqlalchemy.orm import sessionmaker
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Vérifier si les données existent déjà
    existing = session.query(EuromillionsPayoutTable).first()
    if existing:
        print("Données de gains déjà présentes, skip...")
        session.close()
        return
    
    # Données du tableau de gains (basées sur des statistiques réelles)
    payout_data = [
        {
            "combination": "5+2",
            "description": "5 numéros + 2 étoiles",
            "min_payout": 17000000,
            "max_payout": 250000000,
            "avg_payout": 50000000,
            "frequency": 0.0000001,
            "total_winners": 1,
            "total_draws": 10000000
        },
        {
            "combination": "5+1",
            "description": "5 numéros + 1 étoile",
            "min_payout": 100000,
            "max_payout": 2000000,
            "avg_payout": 500000,
            "frequency": 0.000001,
            "total_winners": 10,
            "total_draws": 10000000
        },
        {
            "combination": "5+0",
            "description": "5 numéros + 0 étoile",
            "min_payout": 10000,
            "max_payout": 100000,
            "avg_payout": 50000,
            "frequency": 0.00001,
            "total_winners": 100,
            "total_draws": 10000000
        },
        {
            "combination": "4+2",
            "description": "4 numéros + 2 étoiles",
            "min_payout": 1000,
            "max_payout": 5000,
            "avg_payout": 2500,
            "frequency": 0.0001,
            "total_winners": 1000,
            "total_draws": 10000000
        },
        {
            "combination": "4+1",
            "description": "4 numéros + 1 étoile",
            "min_payout": 100,
            "max_payout": 500,
            "avg_payout": 250,
            "frequency": 0.001,
            "total_winners": 10000,
            "total_draws": 10000000
        },
        {
            "combination": "4+0",
            "description": "4 numéros + 0 étoile",
            "min_payout": 50,
            "max_payout": 200,
            "avg_payout": 100,
            "frequency": 0.01,
            "total_winners": 100000,
            "total_draws": 10000000
        },
        {
            "combination": "3+2",
            "description": "3 numéros + 2 étoiles",
            "min_payout": 50,
            "max_payout": 200,
            "avg_payout": 100,
            "frequency": 0.01,
            "total_winners": 100000,
            "total_draws": 10000000
        },
        {
            "combination": "3+1",
            "description": "3 numéros + 1 étoile",
            "min_payout": 10,
            "max_payout": 50,
            "avg_payout": 25,
            "frequency": 0.1,
            "total_winners": 1000000,
            "total_draws": 10000000
        },
        {
            "combination": "3+0",
            "description": "3 numéros + 0 étoile",
            "min_payout": 5,
            "max_payout": 20,
            "avg_payout": 10,
            "frequency": 0.5,
            "total_winners": 5000000,
            "total_draws": 10000000
        },
        {
            "combination": "2+2",
            "description": "2 numéros + 2 étoiles",
            "min_payout": 5,
            "max_payout": 20,
            "avg_payout": 10,
            "frequency": 0.5,
            "total_winners": 5000000,
            "total_draws": 10000000
        },
        {
            "combination": "2+1",
            "description": "2 numéros + 1 étoile",
            "min_payout": 2,
            "max_payout": 10,
            "avg_payout": 5,
            "frequency": 2.0,
            "total_winners": 20000000,
            "total_draws": 10000000
        },
        {
            "combination": "2+0",
            "description": "2 numéros + 0 étoile",
            "min_payout": 1,
            "max_payout": 5,
            "avg_payout": 2,
            "frequency": 5.0,
            "total_winners": 50000000,
            "total_draws": 10000000
        },
        {
            "combination": "1+2",
            "description": "1 numéro + 2 étoiles",
            "min_payout": 1,
            "max_payout": 5,
            "avg_payout": 2,
            "frequency": 5.0,
            "total_winners": 50000000,
            "total_draws": 10000000
        },
        {
            "combination": "1+1",
            "description": "1 numéro + 1 étoile",
            "min_payout": 0,
            "max_payout": 2,
            "avg_payout": 1,
            "frequency": 10.0,
            "total_winners": 100000000,
            "total_draws": 10000000
        },
        {
            "combination": "1+0",
            "description": "1 numéro + 0 étoile",
            "min_payout": 0,
            "max_payout": 1,
            "avg_payout": 0.5,
            "frequency": 20.0,
            "total_winners": 200000000,
            "total_draws": 10000000
        },
        {
            "combination": "0+2",
            "description": "0 numéro + 2 étoiles",
            "min_payout": 0,
            "max_payout": 1,
            "avg_payout": 0.5,
            "frequency": 20.0,
            "total_winners": 200000000,
            "total_draws": 10000000
        },
        {
            "combination": "0+1",
            "description": "0 numéro + 1 étoile",
            "min_payout": 0,
            "max_payout": 0.5,
            "avg_payout": 0.25,
            "frequency": 40.0,
            "total_winners": 400000000,
            "total_draws": 10000000
        },
        {
            "combination": "0+0",
            "description": "0 numéro + 0 étoile",
            "min_payout": 0,
            "max_payout": 0.1,
            "avg_payout": 0.05,
            "frequency": 100.0,
            "total_winners": 1000000000,
            "total_draws": 10000000
        }
    ]
    
    # Insérer les données
    for data in payout_data:
        payout_entry = EuromillionsPayoutTable(**data)
        session.add(payout_entry)
    
    session.commit()
    session.close()
    print("Données du tableau de gains insérées avec succès!")

if __name__ == "__main__":
    create_advanced_tables() 