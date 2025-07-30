from celery import Celery
from celery.schedules import crontab
import os

# Configuration Celery
celery_app = Celery(
    'lotto_tasks',
    broker='redis://localhost:6379/1',  # Redis comme broker
    backend='redis://localhost:6379/2',  # Redis comme backend pour les résultats
    include=['app.tasks']  # Module contenant les tâches
)

# Configuration des tâches
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Paris',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max par tâche
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # Résultats expirés après 1 heure
)

# Tâches périodiques
celery_app.conf.beat_schedule = {
    'update-daily-stats': {
        'task': 'app.tasks.update_daily_statistics',
        'schedule': crontab(hour=6, minute=0),  # Tous les jours à 6h
    },
    'clean-old-cache': {
        'task': 'app.tasks.clean_old_cache',
        'schedule': crontab(hour=2, minute=0),  # Tous les jours à 2h
    },
    'generate-weekly-report': {
        'task': 'app.tasks.generate_weekly_report',
        'schedule': crontab(day_of_week=1, hour=8, minute=0),  # Tous les lundis à 8h
    },
}

if __name__ == '__main__':
    celery_app.start() 