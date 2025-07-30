import json
import redis
from typing import Optional, Any, Dict, List
from datetime import datetime, timedelta
import hashlib

class CacheManager:
    """Gestionnaire de cache Redis pour optimiser les performances"""
    
    def __init__(self, host='localhost', port=6379, db=0, default_ttl=3600):
        """
        Initialise le gestionnaire de cache
        
        Args:
            host: Adresse du serveur Redis
            port: Port du serveur Redis
            db: Base de données Redis à utiliser
            default_ttl: TTL par défaut en secondes (1 heure)
        """
        try:
            self.redis_client = redis.Redis(
                host=host, 
                port=port, 
                db=db, 
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test de connexion
            self.redis_client.ping()
            self.connected = True
            print("✅ Connexion Redis établie")
        except Exception as e:
            print(f"⚠️ Impossible de se connecter à Redis: {e}")
            self.connected = False
            self.redis_client = None
        
        self.default_ttl = default_ttl
    
    def _generate_cache_key(self, prefix: str, **kwargs) -> str:
        """Génère une clé de cache unique basée sur les paramètres"""
        # Créer un dictionnaire ordonné des paramètres
        params = sorted(kwargs.items())
        param_string = json.dumps(params, sort_keys=True)
        
        # Créer un hash pour une clé plus courte
        hash_object = hashlib.md5(param_string.encode())
        hash_hex = hash_object.hexdigest()[:8]
        
        return f"{prefix}:{hash_hex}"
    
    def get(self, key: str) -> Optional[Any]:
        """Récupère une valeur du cache"""
        if not self.connected or not self.redis_client:
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du cache: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Stocke une valeur dans le cache"""
        if not self.connected or not self.redis_client:
            return False
        
        try:
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            print(f"Erreur lors du stockage en cache: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Supprime une clé du cache"""
        if not self.connected or not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Erreur lors de la suppression du cache: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Supprime toutes les clés correspondant à un pattern"""
        if not self.connected or not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Erreur lors du nettoyage du cache: {e}")
            return 0
    
    def get_stats_cache(self, game_type: str, year: Optional[int] = None, month: Optional[int] = None) -> Optional[Dict]:
        """Récupère les statistiques du cache"""
        cache_key = self._generate_cache_key(
            f"stats:{game_type}", 
            year=year, 
            month=month
        )
        return self.get(cache_key)
    
    def set_stats_cache(self, game_type: str, stats: Dict, year: Optional[int] = None, month: Optional[int] = None, ttl: int = 1800) -> bool:
        """Stocke les statistiques en cache (TTL: 30 minutes)"""
        cache_key = self._generate_cache_key(
            f"stats:{game_type}", 
            year=year, 
            month=month
        )
        return self.set(cache_key, stats, ttl)
    
    def get_quick_stats_cache(self, game_type: str, year: Optional[int] = None, month: Optional[int] = None) -> Optional[Dict]:
        """Récupère les statistiques rapides du cache"""
        cache_key = self._generate_cache_key(
            f"quick_stats:{game_type}", 
            year=year, 
            month=month
        )
        return self.get(cache_key)
    
    def set_quick_stats_cache(self, game_type: str, stats: Dict, year: Optional[int] = None, month: Optional[int] = None, ttl: int = 900) -> bool:
        """Stocke les statistiques rapides en cache (TTL: 15 minutes)"""
        cache_key = self._generate_cache_key(
            f"quick_stats:{game_type}", 
            year=year, 
            month=month
        )
        return self.set(cache_key, stats, ttl)
    
    def get_generation_cache(self, game_type: str, strategy: str, params: Dict) -> Optional[List]:
        """Récupère une génération du cache"""
        cache_key = self._generate_cache_key(
            f"generation:{game_type}:{strategy}", 
            **params
        )
        return self.get(cache_key)
    
    def set_generation_cache(self, game_type: str, strategy: str, grids: List, params: Dict, ttl: int = 300) -> bool:
        """Stocke une génération en cache (TTL: 5 minutes)"""
        cache_key = self._generate_cache_key(
            f"generation:{game_type}:{strategy}", 
            **params
        )
        return self.set(cache_key, grids, ttl)
    
    def clear_stats_cache(self, game_type: str) -> int:
        """Nettoie le cache des statistiques pour un jeu"""
        return self.clear_pattern(f"stats:{game_type}:*")
    
    def clear_generation_cache(self, game_type: str) -> int:
        """Nettoie le cache des générations pour un jeu"""
        return self.clear_pattern(f"generation:{game_type}:*")
    
    def get_cache_info(self) -> Dict:
        """Récupère les informations sur le cache"""
        if not self.connected or not self.redis_client:
            return {"connected": False, "error": "Redis non connecté"}
        
        try:
            info = self.redis_client.info()
            return {
                "connected": True,
                "used_memory": info.get("used_memory_human", "N/A"),
                "total_connections_received": info.get("total_connections_received", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            return {"connected": False, "error": str(e)}

# Instance globale du gestionnaire de cache
cache_manager = CacheManager() 