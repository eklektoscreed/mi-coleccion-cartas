from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import random

app = FastAPI()

# 🔓 Permitir conexión con React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📂 Montar la carpeta 'assets' como estática
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

cards = [
    {
        "nombre": "Eklektos, Heraldo del Destino",
        "imagen": "/assets/EklektosHDD.png"
    },
    {
        "nombre": "La Ilusión de la Caída de Niddhog",
        "imagen": "/assets/ICN.png"
    },
    {
        "nombre": "La Mirada a Través del Velo",
        "imagen": "/assets/LMTV.png"
    },
    {
        "nombre": "Berrian, Sombra de Galanodel",
        "imagen": "/assets/BSG.png"
    },
    {
        "nombre": "Levi, Espada Implacable",
        "imagen": "/assets/LEI.png"
    },
    {
        "nombre": "Jack, Forajido del Caos",
        "imagen": "/assets/JFC.png"
    },
    {
        "nombre": "Niddhog, Devorador de Mundos",
        "imagen": "/assets/NDM.png"
    },
    {
        "nombre": "El Banquete del Gansito",
        "imagen": "/assets/MIT.png"
    },
    {
        "nombre": "La Coronación de Berrian",
        "imagen": "/assets/LCB.png"
    },
    {
        "nombre": "El Enfrentamiento en el Bosque Maldito",
        "imagen": "/assets/EEBM.png"
    },
    {
        "nombre": "La Batalla por Magnia",
        "imagen": "/assets/LBM.png"
    },
    {
        "nombre": "La Caída del Espadachín",
        "imagen": "/assets/LCE.png"
    },
    {
        "nombre": "La Gran Fiesta de Magnia",
        "imagen": "/assets/LBM.png"
    },
    {
        "nombre": "Momento Incómodo en la Taberna",
        "imagen": "/assets/BG.png"
    },
    {
        "nombre": "Confrontación con la Araña Negra",
        "imagen": "/assets/CAN.png"
    },
    {
        "nombre": "El Precio del Poder Arcano",
        "imagen": "/assets/EPPA.png"
    },
    {
        "nombre": "El Paladin Sin Amigos",
        "imagen": "/assets/EPSA.png"
    },
    {
        "nombre": "El Echo de un Hechizo Prohibido",
        "imagen": "/assets/EEHP.png"
    },
    {
        "nombre": "El Echo de un Hechizo Prohibido",
        "imagen": "/assets/EEHP.png"
    },
    {
        "nombre": "Amelia Capitana de la Marea Esmeralda",
        "imagen": "/assets/ACME.png"
    },
    {
        "nombre": "Entre Luz y Oscuridad",
        "imagen": "/assets/ELYO.png"
    }
]

def generar_pack():
    pack = []

    for _ in range(5):
        prob = random.randint(1,400)
        carta = random.choice(cards)

        if prob <= 236:
            rareza = "Common"
        elif prob <= 337:
            rareza = "Uncommon"
        elif prob <= 378:
            rareza = "Rare"
        elif prob <= 399:
            rareza = "Exotic"
        else:
            rareza = "Legendary"

        pack.append({
            "nombre": carta["nombre"],
            "imagen": carta["imagen"],  # ahora accesible vía URL
            "rareza": rareza
        })

    return pack

@app.get("/pack")
def get_pack():
    return generar_pack()