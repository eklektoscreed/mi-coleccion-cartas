import React, { useState, useEffect } from "react";
import { useMemo, useEffect } from "react";

function App() {
  const [revealed, setRevealed] = useState([]);
  const [hover, setHover] = useState({ x: 0, y: 0, index: null });
  const [opening, setOpening] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [collection, setCollection] = useState([]);
  const [reward, setReward] = useState(null);
  const [view, setView] = useState("home"); // "home" o "collection"
  const [page, setPage] = useState(0); // página de colección
  const [zoomCard, setZoomCard] = useState(null); // carta seleccionada para zoom

  const BASE_URL = "http://127.0.0.1:8000";

  const rarezaColor = {
    "Common": "#ccc",
    "Uncommon": "#4caf50",
    "Rare": "#2196f3",
    "Exotic": "#9c27b0",
    "Legendary": "#ff9800",
  };

  const rarezaPrioridad = ["Common", "Uncommon", "Rare", "Exotic", "Legendary"];

  // =======================
  // SONIDOS
  // =======================
  const sounds = useMemo(() => ({
    openPack: new Audio("/sounds/open-pack.mp3"),
    cardReveal: new Audio("/sounds/card-reveal.mp3"),
    flipPage: new Audio("/sounds/flip-page.wav"),
    epic: new Audio("/sounds/epic.wav"),
    legendary: new Audio("/sounds/legendary.mp3"),
  }), []);

  useEffect(() => {
    Object.values(sounds).forEach(s => s.load());
  }, [sounds]);

  // =======================
  // FUNCIONES
  // =======================
  const abrirSobre = async () => {
    setOpening(true);
    setShowCards(false);
    setReward(null);
    setRevealed([]);

    sounds.openPack.currentTime = 0;
    sounds.openPack.play();

    setTimeout(async () => {
      const res = await fetch(`${BASE_URL}/pack`);
      const data = await res.json();

      sounds.cardReveal.currentTime = 0;
      sounds.cardReveal.play();

      setRevealed(data);
      setShowCards(true);
      setOpening(false);
      setCollection(prev => [...prev, ...data]);

      const rareCards = data.filter(c => ["Exotic", "Legendary"].includes(c.rareza));
      if (rareCards.length > 0) {
        setReward(rareCards[0]);

        if (rareCards[0].rareza === "Exotic") {
          sounds.epic.currentTime = 0;
          sounds.epic.play();
        } else if (rareCards[0].rareza === "Legendary") {
          sounds.legendary.currentTime = 0;
          sounds.legendary.play();
        }

        setTimeout(() => setReward(null), 3000);
      }
    }, 1200);
  };

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setHover({ x, y, index });
  };
  const resetHover = () => setHover({ x: 0, y: 0, index: null });

  const handlePageFlip = (newPage) => {
    setPage(newPage);
    sounds.flipPage.currentTime = 0;
    sounds.flipPage.play();
  };

  const holoParticles = Array.from({ length: 10 }, (_, i) => (
    <div key={i} style={{
      position: "absolute",
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      background: "rgba(255,255,255,0.7)",
      borderRadius: "50%",
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      pointerEvents: "none",
      filter: "blur(1px)",
      animation: `float${i} 6s infinite alternate`,
    }} />
  ));

  let dynamicStyles = "";
  revealed.forEach((carta, i) => {
    if (["Rare", "Exotic", "Legendary"].includes(carta.rareza)) {
      dynamicStyles += `
        @keyframes borderPulse_${i} {
          0% { box-shadow: 0 0 15px ${rarezaColor[carta.rareza]}; }
          50% { box-shadow: 0 0 35px ${rarezaColor[carta.rareza]}; }
          100% { box-shadow: 0 0 15px ${rarezaColor[carta.rareza]}; }
        }
      `;
    }
  });

  const cartaMasRara = collection.reduce((prev, curr) => {
    if (!prev) return curr;
    return rarezaPrioridad.indexOf(curr.rareza) > rarezaPrioridad.indexOf(prev.rareza) ? curr : prev;
  }, null);
  const bgColor = cartaMasRara ? rarezaColor[cartaMasRara.rareza] : "#333";

  const collectionMap = collection.reduce((acc, carta) => {
    const key = `${carta.nombre}-${carta.rareza}`;
    if (!acc[key]) acc[key] = { ...carta, count: 1 };
    else acc[key].count++;
    return acc;
  }, {});

  const ITEMS_PER_PAGE = 18;
  const collectionArray = Object.values(collectionMap)
    .sort((a, b) => rarezaPrioridad.indexOf(a.rareza) - rarezaPrioridad.indexOf(b.rareza));
  const totalPages = Math.ceil(collectionArray.length / ITEMS_PER_PAGE);
  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = collectionArray.slice(startIndex, endIndex);
  const firstGrid = pageItems.slice(0, 9);
  const secondGrid = pageItems.slice(9, 18);

  // =======================
  // RENDER
  // =======================
  if (view === "home") {
    return (
      <div style={{
        textAlign: "center",
        minHeight: "100vh",
        padding: "20px",
        background: `url('https://i.imgur.com/P64EONg.png') center/cover no-repeat`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        transition: "background-color 0.5s",
        backgroundColor: bgColor,
        animation: cartaMasRara ? `bgPulse 1.5s infinite alternate` : "none"
      }}>
        <h1 style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.7)" }}>Simulador de sobres</h1>
        <button onClick={abrirSobre} style={{ marginBottom: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>Abrir sobre</button>
        <button onClick={() => setView("collection")} style={{ marginBottom: "40px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Ver Colección
        </button>

        {!showCards && (
          <div className={`sobre ${opening ? 'abriendo' : ''}`} style={{ background: "url('https://i.imgur.com/aS22fKr.png') center/cover no-repeat" }}>
            <div className="solapa"></div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          {showCards && revealed.map((carta, i) => {
            const imageUrl = carta.imagen.startsWith("http") ? carta.imagen : `${BASE_URL}${carta.imagen}`;
            const isHover = hover.index === i;
            const rotateX = isHover ? -(hover.y - 0.5) * 25 : 0;
            const rotateY = isHover ? (hover.x - 0.5) * 25 : 0;
            const scale = isHover ? 1.25 : 1;

            let efecto = null;
            if (carta.rareza === "Rare") {
              efecto = <div style={{ position: "absolute", top:0,left:0,width:"100%",height:"100%" }}>{holoParticles}</div>;
            } else if (carta.rareza === "Exotic") {
              efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen" }} />;
            } else if (carta.rareza === "Legendary") {
              efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen" }}>{holoParticles}</div>;
            }

            return (
              <div key={i} style={{ cursor: "pointer", perspective: "1000px", width: "180px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "180px",
                  height: "260px",
                  marginBottom: "35px",
                  overflow: "visible",
                  position: "relative",
                  opacity: 0,
                  animation: `fadeIn 0.6s forwards ${i * 0.2}s`
                }}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={resetHover}
                onClick={() => setZoomCard(carta)}
                >
                  <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.15s",
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
                    position: "relative",
                    boxShadow: `0 0 25px ${rarezaColor[carta.rareza] || "#fff"}`,
                    animation: ["Rare","Exotic","Legendary"].includes(carta.rareza) ? `borderPulse_${i} 1.5s infinite alternate` : "none"
                  }}>
                    <img src={imageUrl} alt={carta.nombre} style={{ width: "100%", height: "100%", display: "block" }} />
                    {efecto}
                  </div>
                </div>
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "16px", textAlign: "center", textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>{carta.nombre}</p>
                <p style={{ margin: 0, color: rarezaColor[carta.rareza] || "#fff", fontWeight: "bold", textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>{carta.rareza}</p>
              </div>
            );
          })}
        </div>

        {reward && (
          <div style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "20px",
            background: `radial-gradient(circle, ${rarezaColor[reward.rareza]} 0%, transparent 70%)`,
            borderRadius: "15px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
            boxShadow: `0 0 30px ${rarezaColor[reward.rareza]}`,
            animation: "zoomIn 0.6s forwards"
          }}>
            🎉 {reward.rareza} obtenida! 🎉
          </div>
        )}

        {/* MODAL ZOOM */}
        {zoomCard && (
          <div style={{
            position: "fixed",
            top:0, left:0, width:"100%", height:"100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer"
          }}
          onClick={() => setZoomCard(null)}
          >
            <div style={{ position:"relative", width:"400px", height:"580px", borderRadius:"15px", overflow:"hidden", boxShadow:`0 0 50px ${rarezaColor[zoomCard.rareza]}` }}>
              <img src={zoomCard.imagen.startsWith("http") ? zoomCard.imagen : `${BASE_URL}${zoomCard.imagen}`} alt={zoomCard.nombre} style={{ width:"100%", height:"100%" }} />
              {["Rare","Exotic","Legendary"].includes(zoomCard.rareza) && (() => {
                let efecto = null;
                if (zoomCard.rareza === "Rare") {
                  efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%" }}>{holoParticles}</div>;
                } else if (zoomCard.rareza === "Exotic") {
                  efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen" }} />;
                } else if (zoomCard.rareza === "Legendary") {
                  efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen" }}>{holoParticles}</div>;
                }
                return efecto;
              })()}
            </div>
          </div>
        )}

        <style>{`
          .sobre { width: 470px; height: 662px; border-radius: 12px; position: relative; margin: 0 auto 50px auto; box-shadow: 0 0 20px rgba(0,0,0,0.5); overflow: hidden; }
          .solapa { width: 100%; height: 500px; background: url('https://i.imgur.com/aS22fKr.png') center/cover no-repeat; position: absolute; top: 0; left: 0; transform-origin: top; }
          .sobre.abriendo .solapa { animation: abrirSolapa 2.0s forwards; }
          @keyframes abrirSolapa { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-120deg); } }
          @keyframes fadeIn { to { opacity: 1; } }
          @keyframes bgPulse { 0% { background-color: ${bgColor}; } 50% { background-color: #000; } 100% { background-color: ${bgColor}; } }
          @keyframes zoomIn { 0% { transform: translateX(-50%) scale(0); } 100% { transform: translateX(-50%) scale(1); } }
          ${dynamicStyles}
        `}</style>
      </div>
    );
  }

  // =======================
  // VISTA COLECCIÓN
  // =======================
  return (
    <div style={{
      textAlign: "center",
      minHeight: "100vh",
      padding: "20px",
      background: "url('https://i.imgur.com/O9zh2Fo.png') center/cover no-repeat",
      backgroundPositionY: "-7px",
      backgroundPositionX: "center",
      transition: "background-color 0.5s",
      overflow: "hidden"
    }}>
      <h1 style={{ textShadow: "2px 2px 5px rgba(0,0,0,0.7)" }}>Mi Colección</h1>
      <button onClick={() => setView("home")} style={{ marginBottom: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
        Volver
      </button>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "140px",
        marginBottom: "30px",
        perspective: "1000px"
      }}>
        {[firstGrid, secondGrid].map((grid, gridIndex) => (
          <div key={gridIndex} style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 150px)",
            gridTemplateRows: "repeat(3, 220px)",
            gap: "20px 20px"
          }}>
            {grid.map((c, idx) => {
              const imgUrl = c.imagen.startsWith("http") ? c.imagen : `${BASE_URL}${c.imagen}`;
              const isHover = hover.index === idx + gridIndex * 9;
              const scale = isHover ? 1.3 : 1;
              const zIndex = isHover ? 100 : idx + gridIndex * 9;
              return (
                <div key={idx} style={{
                  position: "relative",
                  width: "150px",
                  height: "220px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: `0 0 8px ${rarezaColor[c.rareza]}`,
                  transform: `scale(${scale})`,
                  zIndex: zIndex,
                  transition: "transform 0.2s, z-index 0.2s",
                  cursor: "pointer"
                }}
                onMouseMove={(e) => handleMouseMove(e, idx + gridIndex * 9)}
                onMouseLeave={resetHover}
                onClick={() => setZoomCard(c)}
                >
                  <img src={imgUrl} alt={c.nombre} style={{ width: "100%", height: "100%", display: "block" }} />
                  {["Rare","Exotic","Legendary"].includes(c.rareza) && (() => {
                    let efecto = null;
                    if (c.rareza === "Rare") {
                      efecto = <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}>{holoParticles}</div>;
                    } else if (c.rareza === "Exotic") {
                      efecto = <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen"}} />;
                    } else if (c.rareza === "Legendary") {
                      efecto = <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen"}}>{holoParticles}</div>;
                    }
                    return efecto;
                  })()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => handlePageFlip(i)} style={{
            padding: "6px 10px",
            fontSize: "14px",
            cursor: "pointer",
            fontWeight: page === i ? "bold" : "normal",
            textDecoration: page === i ? "underline" : "none"
          }}>{i + 1}</button>
        ))}
      </div>

      {/* MODAL ZOOM */}
      {zoomCard && (
        <div style={{
          position: "fixed",
          top:0, left:0, width:"100%", height:"100%",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          cursor: "pointer"
        }}
        onClick={() => setZoomCard(null)}
        >
          <div style={{ position:"relative", width:"400px", height:"580px", borderRadius:"15px", overflow:"hidden", boxShadow:`0 0 50px ${rarezaColor[zoomCard.rareza]}` }}>
            <img src={zoomCard.imagen.startsWith("http") ? zoomCard.imagen : `${BASE_URL}${zoomCard.imagen}`} alt={zoomCard.nombre} style={{ width:"100%", height:"100%" }} />
            {["Rare","Exotic","Legendary"].includes(zoomCard.rareza) && (() => {
              let efecto = null;
              if (zoomCard.rareza === "Rare") {
                efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%" }}>{holoParticles}</div>;
              } else if (zoomCard.rareza === "Exotic") {
                efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen" }} />;
              } else if (zoomCard.rareza === "Legendary") {
                efecto = <div style={{ position:"absolute", top:0,left:0,width:"100%",height:"100%", background:"linear-gradient(120deg, rgba(255,0,150,0.25), rgba(0,255,255,0.25), rgba(255,255,0,0.25))", mixBlendMode:"screen"}}>{holoParticles}</div>;
              }
              return efecto;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;