-- =====================================================
-- Script de création des tables pour Supabase
-- Générateur de Grilles Loto & Euromillions
-- =====================================================

-- Table des tirages Euromillions
CREATE TABLE IF NOT EXISTS draws_euromillions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    n1 INTEGER NOT NULL CHECK (n1 >= 1 AND n1 <= 50),
    n2 INTEGER NOT NULL CHECK (n2 >= 1 AND n2 <= 50),
    n3 INTEGER NOT NULL CHECK (n3 >= 1 AND n3 <= 50),
    n4 INTEGER NOT NULL CHECK (n4 >= 1 AND n4 <= 50),
    n5 INTEGER NOT NULL CHECK (n5 >= 1 AND n5 <= 50),
    e1 INTEGER NOT NULL CHECK (e1 >= 1 AND e1 <= 12),
    e2 INTEGER NOT NULL CHECK (e2 >= 1 AND e2 <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tirages Loto
CREATE TABLE IF NOT EXISTS draws_loto (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    n1 INTEGER NOT NULL CHECK (n1 >= 1 AND n1 <= 45),
    n2 INTEGER NOT NULL CHECK (n2 >= 1 AND n2 <= 45),
    n3 INTEGER NOT NULL CHECK (n3 >= 1 AND n3 <= 45),
    n4 INTEGER NOT NULL CHECK (n4 >= 1 AND n4 <= 45),
    n5 INTEGER NOT NULL CHECK (n5 >= 1 AND n5 <= 45),
    n6 INTEGER NOT NULL CHECK (n6 >= 1 AND n6 <= 45),
    complementaire INTEGER NOT NULL CHECK (complementaire >= 1 AND complementaire <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des statistiques
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    jeu TEXT NOT NULL CHECK (jeu IN ('euromillions', 'loto')),
    numero INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('numero', 'etoile', 'complementaire')),
    frequence FLOAT NOT NULL CHECK (frequence >= 0 AND frequence <= 1),
    periode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_draws_euromillions_date ON draws_euromillions(date);
CREATE INDEX IF NOT EXISTS idx_draws_loto_date ON draws_loto(date);
CREATE INDEX IF NOT EXISTS idx_stats_jeu_type ON stats(jeu, type);

-- Contraintes pour éviter les doublons
ALTER TABLE draws_euromillions ADD CONSTRAINT unique_euromillions_draw UNIQUE (date, n1, n2, n3, n4, n5, e1, e2);
ALTER TABLE draws_loto ADD CONSTRAINT unique_loto_draw UNIQUE (date, n1, n2, n3, n4, n5, n6, complementaire);

-- RLS (Row Level Security) - Désactivé pour permettre l'accès public
ALTER TABLE draws_euromillions DISABLE ROW LEVEL SECURITY;
ALTER TABLE draws_loto DISABLE ROW LEVEL SECURITY;
ALTER TABLE stats DISABLE ROW LEVEL SECURITY;

-- Politiques d'accès (si RLS est activé)
-- CREATE POLICY "Allow public read access" ON draws_euromillions FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON draws_loto FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON stats FOR SELECT USING (true);

-- Messages de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables créées avec succès !';
    RAISE NOTICE '📊 Tables disponibles :';
    RAISE NOTICE '   - draws_euromillions (tirages Euromillions)';
    RAISE NOTICE '   - draws_loto (tirages Loto)';
    RAISE NOTICE '   - stats (statistiques)';
    RAISE NOTICE '🎉 Base de données prête pour l''application !';
END $$; 