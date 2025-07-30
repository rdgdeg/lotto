from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from .routers import euromillions, loto, import_csv, history, euromillions_advanced, advanced_stats, loto_advanced

app = FastAPI(title="Générateur de grilles Loto & Euromillions")

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Générateur de grilles Loto & Euromillions</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .links { margin-top: 30px; }
            .link-card { background: #3498db; color: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-decoration: none; display: block; }
            .link-card:hover { background: #2980b9; }
            .api-info { background: #ecf0f1; padding: 20px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎰 Générateur de grilles Loto & Euromillions</h1>
            <p>Bienvenue dans votre application de gestion et d'analyse des tirages de loterie !</p>
            
            <div class="links">
                <a href="/docs" class="link-card">📚 Documentation API (Swagger)</a>
                <a href="/api/euromillions" class="link-card">🇪🇺 Gestion Euromillions</a>
                <a href="/api/loto" class="link-card">🇫🇷 Gestion Loto</a>
                <a href="/api/history" class="link-card">📊 Historique des tirages</a>
            </div>
            
            <div class="api-info">
                <h3>🚀 API Endpoints disponibles :</h3>
                <ul>
                    <li><strong>/api/euromillions</strong> - Gestion des tirages Euromillions</li>
                    <li><strong>/api/loto</strong> - Gestion des tirages Loto</li>
                    <li><strong>/api/import</strong> - Import de données CSV</li>
                    <li><strong>/api/history</strong> - Historique et statistiques</li>
                    <li><strong>/docs</strong> - Documentation interactive</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    """

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(euromillions.router, prefix="/api/euromillions", tags=["Euromillions"])
app.include_router(euromillions_advanced.router, prefix="/api", tags=["Euromillions Advanced"])
app.include_router(advanced_stats.router, prefix="/api", tags=["Advanced Statistics"])
app.include_router(loto.router, prefix="/api/loto", tags=["Loto"])
app.include_router(loto_advanced.router, tags=["Loto Advanced"])
app.include_router(import_csv.router, prefix="/api/import", tags=["Import CSV"])
app.include_router(history.router, prefix="/api/history", tags=["Historique"]) 