import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import EditDrawModal from './EditDrawModal';

interface Draw {
  id: number;
  date: string;
  numbers: number[];
  stars?: number[];
  chanceNumber?: number;
  gameType: 'euromillions' | 'lotto';
  jackpot?: string;
  winners?: number;
}

interface CompleteDrawHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
}

const CompleteDrawHistory: React.FC<CompleteDrawHistoryProps> = ({ isOpen, onClose, gameType }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'numbers'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [yearsAvailable, setYearsAvailable] = useState<number[]>([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [drawToEdit, setDrawToEdit] = useState<Draw | null>(null);

  // Charger les données
  useEffect(() => {
    if (isOpen) {
      fetchDraws();
    }
  }, [isOpen, gameType, selectedYear]);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = gameType === 'euromillions' ? 'http://localhost:8000/api/history/euromillions' : 'http://localhost:8000/api/history/loto';
      const params = new URLSearchParams();
      
      if (selectedYear !== 'all') {
        params.append('year', selectedYear);
      }
      params.append('limit', '1000'); // Récupérer tous les tirages
      
      console.log('Fetching draws from:', `${endpoint}?${params}`);
      const response = await axios.get(`${endpoint}?${params}`);
      const data = response.data;
      console.log('Response data:', data);
      
      // Transformer les données pour correspondre à l'interface Draw
      const transformedDraws: Draw[] = data.draws.map((draw: any) => ({
        id: draw.id || draw.draw_id,
        date: draw.date,
        numbers: gameType === 'euromillions' 
          ? [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
          : [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6],
        stars: gameType === 'euromillions' ? [draw.e1, draw.e2] : undefined,
        chanceNumber: gameType === 'lotto' ? draw.complementaire : undefined,
        gameType,
        jackpot: draw.jackpot,
        winners: draw.winners
      }));
      
      setDraws(transformedDraws);
      setYearsAvailable(data.years_available || []);
      setTotalDraws(data.total_draws || transformedDraws.length);
      
      // Afficher un avertissement si tous les tirages ne sont pas chargés
      if (data.total_draws && data.total_draws > transformedDraws.length) {
        console.warn(`⚠️ Seulement ${transformedDraws.length} tirages sur ${data.total_draws} sont affichés (limite API)`);
      }
      
      setCurrentPage(1); // Retour à la première page lors du changement de filtre
    } catch (err: any) {
      console.error('Erreur lors du chargement des tirages:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Erreur lors du chargement des tirages: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et tri des tirages
  const filteredDraws = useMemo(() => {
    let filtered = draws;

    // Filtre par mois
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(draw => draw.date.includes(`-${selectedMonth}-`));
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(draw => 
        draw.numbers.some(num => num.toString().includes(searchTerm)) ||
        draw.stars?.some(star => star.toString().includes(searchTerm)) ||
        draw.chanceNumber?.toString().includes(searchTerm) ||
        draw.date.includes(searchTerm) ||
        draw.id.toString().includes(searchTerm)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        // Tri par numéros (premier numéro)
        comparison = a.numbers[0] - b.numbers[0];
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [draws, selectedMonth, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredDraws.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDraws = filteredDraws.slice(startIndex, endIndex);

  // Génération des options d'années et mois
  const years = useMemo(() => {
    const uniqueYears = [...new Set(draws.map(draw => new Date(draw.date).getFullYear()))];
    return uniqueYears.sort((a, b) => b - a); // Années décroissantes
  }, [draws]);

  const months = useMemo(() => {
    const uniqueMonths = [...new Set(draws.map(draw => new Date(draw.date).getMonth() + 1))];
    return uniqueMonths.sort((a, b) => a - b); // Mois croissants
  }, [draws]);

  const handleDrawClick = (draw: Draw) => {
    setSelectedDraw(draw);
  };

  const handleEditDraw = (draw: Draw) => {
    setDrawToEdit(draw);
    setShowEditModal(true);
  };

  const handleEditSuccess = (message: string) => {
    alert(message);
    fetchDraws(); // Recharger les données
    setShowEditModal(false);
    setDrawToEdit(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumbers = (numbers: number[]) => {
    return numbers.map(num => num.toString().padStart(2, '0')).join(' - ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800">
            📅 Historique des Tirages {gameType === 'euromillions' ? 'Euromillions' : 'Loto'}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Filtres et recherche */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les années</option>
                {yearsAvailable.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mois
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les mois</option>
                {months.map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>
                    {new Date(2024, month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Numéro, date, ID..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'numbers')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="numbers">Numéros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalDraws}</div>
                <div className="text-sm text-gray-600">Total des tirages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{filteredDraws.length}</div>
                <div className="text-sm text-gray-600">Tirages filtrés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{yearsAvailable.length}</div>
                <div className="text-sm text-gray-600">Années disponibles</div>
              </div>
          </div>
        </div>

        {/* Liste des tirages */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des tirages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchDraws}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          ) : filteredDraws.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun tirage trouvé avec les critères sélectionnés</p>
            </div>
          ) : (
            <>
        <div className="space-y-3 max-h-96 overflow-y-auto">
                {paginatedDraws.map((draw) => (
            <div
              key={draw.id}
              onClick={() => handleDrawClick(draw)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-gray-800">
                          {formatDate(draw.date)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                          #{draw.id}
                  </span>
                </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDraw(draw);
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Modifier
                        </button>
                <div className="text-right">
                  {draw.jackpot && (
                    <div className="text-sm font-medium text-green-600">
                      {draw.jackpot}
                    </div>
                  )}
                  {draw.winners !== undefined && (
                    <div className="text-xs text-gray-500">
                      {draw.winners} gagnant{draw.winners !== 1 ? 's' : ''}
                    </div>
                  )}
                        </div>
                </div>
              </div>

              <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Numéros : </span>
                        <span className="font-mono text-lg font-bold text-blue-600">
                          {formatNumbers(draw.numbers)}
                        </span>
                      </div>
                      
                      {gameType === 'euromillions' && draw.stars && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">⭐ Étoiles : </span>
                          <span className="font-mono text-lg font-bold text-yellow-600">
                            {formatNumbers(draw.stars)}
                          </span>
                        </div>
                      )}
                      
                      {gameType === 'lotto' && draw.chanceNumber && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">🍀 Complémentaire : </span>
                          <span className="font-mono text-lg font-bold text-green-600">
                            {draw.chanceNumber.toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredDraws.length)} sur {filteredDraws.length} tirages)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 border rounded text-sm ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modale détail du tirage */}
        {selectedDraw && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  📅 Détail du tirage #{selectedDraw.id}
                </h3>
                <button
                  onClick={() => setSelectedDraw(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Date</h4>
                  <p className="text-lg">{formatDate(selectedDraw.date)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Numéros</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDraw.numbers.map((num, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                      >
                        {num.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {gameType === 'euromillions' && selectedDraw.stars && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">⭐ Étoiles</h4>
                    <div className="flex gap-2">
                      {selectedDraw.stars.map((star, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg"
                        >
                          {star.toString().padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gameType === 'lotto' && selectedDraw.chanceNumber && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🍀 Complémentaire</h4>
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedDraw.chanceNumber.toString().padStart(2, '0')}
                    </div>
                  </div>
                )}
                
                {selectedDraw.jackpot && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">💰 Jackpot</h4>
                    <p className="text-lg font-bold text-green-600">{selectedDraw.jackpot}</p>
                  </div>
                )}
                
                {selectedDraw.winners !== undefined && (
                    <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🏆 Gagnants</h4>
                    <p className="text-lg">{selectedDraw.winners} gagnant{selectedDraw.winners !== 1 ? 's' : ''}</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Modal d'édition */}
        {showEditModal && drawToEdit && (
          <EditDrawModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setDrawToEdit(null);
            }}
            draw={drawToEdit}
            gameType={gameType}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default CompleteDrawHistory; 