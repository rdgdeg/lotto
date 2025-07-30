from sqlalchemy import Column, Integer, Date, Sequence, String, Float, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DrawEuromillions(Base):
    __tablename__ = "draws_euromillions"
    id = Column(Integer, Sequence('euromillions_id_seq'), primary_key=True)
    date = Column(Date)
    n1 = Column(Integer)
    n2 = Column(Integer)
    n3 = Column(Integer)
    n4 = Column(Integer)
    n5 = Column(Integer)
    e1 = Column(Integer)
    e2 = Column(Integer)

class DrawLoto(Base):
    __tablename__ = "draws_loto"
    id = Column(Integer, Sequence('loto_id_seq'), primary_key=True)
    date = Column(Date)
    n1 = Column(Integer)
    n2 = Column(Integer)
    n3 = Column(Integer)
    n4 = Column(Integer)
    n5 = Column(Integer)
    n6 = Column(Integer)
    complementaire = Column(Integer)

class Statistique(Base):
    __tablename__ = "stats"
    id = Column(Integer, primary_key=True)
    jeu = Column(String, index=True)  # 'euromillions' ou 'loto'
    numero = Column(Integer)  # numéro ou étoile
    type = Column(String)  # 'numero', 'etoile', 'complementaire', etc.
    frequence = Column(Float)
    periode = Column(String, nullable=True)  # ex: '2003-2023'

class EuromillionsPayoutTable(Base):
    __tablename__ = "euromillions_payouts"
    id = Column(Integer, primary_key=True)
    combination = Column(String)  # ex: "5+2", "5+1", "4+2", etc.
    description = Column(String)
    min_payout = Column(Float)
    max_payout = Column(Float)
    avg_payout = Column(Float)
    frequency = Column(Float)  # fréquence de cette combinaison
    total_winners = Column(Integer)
    total_draws = Column(Integer)

class EuromillionsCombination(Base):
    __tablename__ = "euromillions_combinations"
    id = Column(Integer, primary_key=True)
    combination_type = Column(String)  # 'pairs', 'triplets', 'quads', 'quintets'
    numbers = Column(JSON)  # liste des numéros
    stars = Column(JSON)  # liste des étoiles
    frequency = Column(Float)
    last_appearance = Column(Date, nullable=True)
    first_appearance = Column(Date, nullable=True)
    total_appearances = Column(Integer)

class EuromillionsPattern(Base):
    __tablename__ = "euromillions_patterns"
    id = Column(Integer, primary_key=True)
    pattern_type = Column(String)  # 'odd_even', 'high_low', 'sum_range', 'consecutive'
    pattern_value = Column(String)  # ex: "3odd_2even", "high_sum", etc.
    frequency = Column(Float)
    probability = Column(Float)
    last_appearance = Column(Date, nullable=True)
    total_appearances = Column(Integer) 