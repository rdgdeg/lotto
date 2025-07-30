import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Draw {
  id: number;
  date: string;
  numeros: number[];
  etoiles?: number[];
  bonus?: number;
}

interface NumberHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'euromillions' | 'lotto';
  number: number;
  numberType: 'numero' | 'etoile' | 'bonus';
}

const NumberHistoryModal: React.FC<NumberHistoryModalProps> = ({
  isOpen,
  onClose,
  gameType,
  number,
  numberType
}) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDraws, setTotalDraws] = useState(0);
  const [sortBy, setSortBy] = useState<'date' | 'id'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen && number) {
      // Reset filters when opening modal
      setCurrentPage(1);
      setSortBy('date');
      setSortOrder('desc');
      setYearFilter('all');
      fetchNumberHistory();
    }
  }, [isOpen, number, gameType, numberType, currentPage, sortBy, sortOrder, yearFilter]);

  const fetchNumberHistory = async () => {
    setLoading(true);
    setError(null);

    const url = `http://localhost:8000/api/${gameType}/number/${number}`;
    const params = {
      type: numberType,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      year: yearFilter !== 'all' ? yearFilter : undefined
    };

    console.log('🔍 Tentative de connexion à:', url);
    console.log('📋 Paramètres:', params);

    try {
      const response = await axios.get(url, { params });
      console.log('✅ Réponse reçue:', response.data);

      const data = response.data;
      setDraws(data.draws || []);
      setTotalDraws(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement de l\'historique:', err);
      console.error('📄 Détails de l\'erreur:', err.response?.data);
      setError(err.response?.data?.detail || 'Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getNumberTypeLabel = () => {
    switch (numberType) {
      case 'numero':
        return 'Numéro';
      case 'etoile':
        return 'Étoile';
      case 'bonus':
        return 'Bonus';
      default:
        return 'Numéro';
    }
  };

  const getGameLabel = () => {
    return gameType === 'euromillions' ? 'Euromillions' : 'Loto';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📅 Historique du {getNumberTypeLabel()} {number.toString().padStart(2, '0')}
            </h2>
            <p className="text-gray-600 mt-1">
              {getGameLabel()} - {totalDraws} tirages trouvés
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Contrôles de tri et filtres */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Trier par :</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'id')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="id">Numéro de tirage</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Année :</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Toutes les années</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                  <option value="2017">2017</option>
                  <option value="2016">2016</option>
                  <option value="2015">2015</option>
                  <option value="2014">2014</option>
                  <option value="2013">2013</option>
                  <option value="2012">2012</option>
                  <option value="2011">2011</option>
                  <option value="2010">2010</option>
                  <option value="2009">2009</option>
                  <option value="2008">2008</option>
                  <option value="2007">2007</option>
                  <option value="2006">2006</option>
                  <option value="2005">2005</option>
                  <option value="2004">2004</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {totalDraws} tirages trouvés
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
            </div>
          ) : (
            <>
              {/* Liste des tirages */}
              <div className="space-y-3">
                {draws.map((draw) => (
                  <div
                    key={draw.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">
                        Tirage #{draw.id}
                      </span>
                      <span className="text-gray-600">
                        {formatDate(draw.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Numéros :</span>
                      <div className="flex gap-1">
                        {draw.numeros.map((num, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              num === number && numberType === 'numero'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {num.toString().padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(draw.etoiles || draw.bonus) && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">
                          {gameType === 'euromillions' ? 'Étoiles' : 'Bonus'} :
                        </span>
                        <div className="flex gap-1">
                          {gameType === 'euromillions' ? (
                            (draw.etoiles || []).map((num, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  num === number && numberType === 'etoile'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {num.toString().padStart(2, '0')}
                              </span>
                            ))
                          ) : (
                            draw.bonus && (
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  draw.bonus === number && numberType === 'bonus'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {draw.bonus.toString().padStart(2, '0')}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 border rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              )}

              {/* Informations de pagination */}
              <div className="mt-4 text-center text-sm text-gray-600">
                Page {currentPage} sur {totalPages} - {totalDraws} tirages au total
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberHistoryModal; 