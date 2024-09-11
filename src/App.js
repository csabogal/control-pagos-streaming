import React, { useState, useEffect } from "react";
import "./App.css";

const plataformasIniciales = [
  { nombre: "Prime Video", costo: 23000, tipo: "normal" },
  { nombre: "Disney+", costo: 47000, tipo: "normal" },
  { nombre: "HBO Max", costo: 25000, tipo: "normal" },
  { nombre: "Spotify", costo: 26400, tipo: "rotativo", participantes: 6 },
];

function App() {
  const [plataformas] = useState(plataformasIniciales);
  const [participantes, setParticipantes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoNombreParticipante, setNuevoNombreParticipante] = useState("");
  const [plataformasSeleccionadas, setPlataformasSeleccionadas] = useState({});

  useEffect(() => {
    const storedParticipantes = JSON.parse(
      localStorage.getItem("participantes")
    );
    if (storedParticipantes) {
      setParticipantes(storedParticipantes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("participantes", JSON.stringify(participantes));
  }, [participantes]);

  const agregarParticipante = () => {
    setMostrarFormulario(true);
  };

  const manejarCambioNombre = (e) => {
    setNuevoNombreParticipante(e.target.value);
  };

  const manejarCambioCheckbox = (nombrePlataforma) => {
    setPlataformasSeleccionadas((prev) => ({
      ...prev,
      [nombrePlataforma]: !prev[nombrePlataforma],
    }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (nuevoNombreParticipante) {
      setParticipantes([
        ...participantes,
        {
          nombre: nuevoNombreParticipante,
          plataformas: plataformasSeleccionadas,
          pagado: false,
        },
      ]);
      setMostrarFormulario(false);
      setNuevoNombreParticipante("");
      setPlataformasSeleccionadas({});
    }
  };

  const marcarPago = (participanteIndex) => {
    const nuevosParticipantes = [...participantes];
    nuevosParticipantes[participanteIndex].pagado =
      !nuevosParticipantes[participanteIndex].pagado;
    setParticipantes(nuevosParticipantes);
  };

  const reiniciarPagos = () => {
    if (
      window.confirm("¿Está seguro de que desea reiniciar todos los pagos?")
    ) {
      const nuevosParticipantes = participantes.map((participante) => ({
        ...participante,
        pagado: false,
      }));
      setParticipantes(nuevosParticipantes);
    }
  };

  const calcularCostoPorParticipanteRaw = (
    costoTotal,
    plataformaNombre,
    plataforma
  ) => {
    if (plataforma.tipo === "rotativo") {
      return costoTotal;
    }
    switch (plataformaNombre) {
      case "Prime Video":
        return Math.round(costoTotal / 6 / 1000) * 1000;
      case "Disney+":
        return 6800;
      case "HBO Max":
        return Math.round(costoTotal / 5);
      default:
        return Math.round(
          costoTotal / (participantes.length > 0 ? participantes.length : 1)
        );
    }
  };

  const calcularCostoPorParticipante = (
    costoTotal,
    plataformaNombre,
    plataforma
  ) => {
    const resultado = calcularCostoPorParticipanteRaw(
      costoTotal,
      plataformaNombre,
      plataforma
    );
    return formatCurrency(resultado);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calcularTotalPorParticipante = (participante) => {
    const total = plataformas.reduce((total, plataforma) => {
      if (participante.plataformas[plataforma.nombre]) {
        const costoPorParticipante = calcularCostoPorParticipanteRaw(
          plataforma.costo,
          plataforma.nombre,
          plataforma
        );
        total += costoPorParticipante;
      }
      return total;
    }, 0);
    return formatCurrency(Math.round(total));
  };

  const toggleSpotifyParticipante = (index) => {
    const nuevosParticipantes = [...participantes];
    const plataformaSpotify = plataformas.find((p) => p.nombre === "Spotify");
    if (plataformaSpotify) {
      nuevosParticipantes[index].plataformas["Spotify"] =
        !nuevosParticipantes[index].plataformas["Spotify"];
      setParticipantes(nuevosParticipantes);
    }
  };

  return (
    <div className="App">
      <h1>Control de Pagos de Streaming</h1>

      <div className="plataformas">
        {plataformas.map((plataforma) => (
          <div key={plataforma.nombre} className="plataforma">
            <h2>{plataforma.nombre}</h2>
            <p>Costo total: {formatCurrency(plataforma.costo)}</p>
            {plataforma.tipo === "normal" ? (
              <p>
                Costo por participante:{" "}
                {calcularCostoPorParticipante(
                  plataforma.costo,
                  plataforma.nombre,
                  plataforma
                )}
              </p>
            ) : (
              <div>
                <p>Participantes que pagan el mes completo:</p>
                {participantes.map((participante, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`spotify-${participante.nombre}`}
                      checked={
                        participante.plataformas[plataforma.nombre] || false
                      }
                      onChange={() => toggleSpotifyParticipante(index)}
                    />
                    <label htmlFor={`spotify-${participante.nombre}`}>
                      {participante.nombre}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="participantes">
        {participantes.map((participante, index) => (
          <div key={index} className="participante">
            <h3>{participante.nombre}</h3>
            <button
              onClick={() => marcarPago(index)}
              className={participante.pagado ? "pagado" : "pendiente"}
            >
              {participante.pagado ? "Pagado" : "Pendiente"}
            </button>
            <p>Total a pagar: {calcularTotalPorParticipante(participante)}</p>
          </div>
        ))}
      </div>

      {!mostrarFormulario && (
        <button onClick={agregarParticipante}>Agregar Participante</button>
      )}
      {mostrarFormulario && (
        <form onSubmit={manejarEnvio}>
          <input
            type="text"
            value={nuevoNombreParticipante}
            onChange={manejarCambioNombre}
            placeholder="Nombre del participante"
            required
          />
          {plataformas.map((plataforma) => (
            <div key={plataforma.nombre}>
              <input
                type="checkbox"
                id={plataforma.nombre}
                name={plataforma.nombre}
                checked={plataformasSeleccionadas[plataforma.nombre] || false}
                onChange={() => manejarCambioCheckbox(plataforma.nombre)}
              />
              <label htmlFor={plataforma.nombre}>{plataforma.nombre}</label>
            </div>
          ))}
          <button type="submit">Agregar</button>
          <button type="button" onClick={() => setMostrarFormulario(false)}>
            Cancelar
          </button>
        </form>
      )}

      <button onClick={reiniciarPagos}>Reiniciar Pagos</button>
    </div>
  );
}

export default App;
