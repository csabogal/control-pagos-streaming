const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const db = require("./db");

app.use(cors());
app.use(express.json());

app.get("/plataformas", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM plataformas");
  res.json(rows);
});

app.get("/plataformas/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query("SELECT * FROM plataformas WHERE id = ?", [id]);
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ message: "Plataforma no encontrada" });
  }
});

app.post("/plataformas", async (req, res) => {
  const { nombre, costo, tipo, participantes } = req.body;
  const [result] = await db.query(
    "INSERT INTO plataformas (nombre, costo, tipo, participantes) VALUES (?, ?, ?, ?)",
    [nombre, costo, tipo, participantes]
  );
  res
    .status(201)
    .json({ id: result.insertId, nombre, costo, tipo, participantes });
});

app.put("/plataformas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, costo, tipo, participantes } = req.body;
  const [result] = await db.query(
    "UPDATE plataformas SET nombre = ?, costo = ?, tipo = ?, participantes = ? WHERE id = ?",
    [nombre, costo, tipo, participantes, id]
  );
  if (result.affectedRows > 0) {
    res.json({ id, nombre, costo, tipo, participantes });
  } else {
    res.status(404).json({ message: "Plataforma no encontrada" });
  }
});

app.delete("/plataformas/:id", async (req, res) => {
  const { id } = req.params;
  const [result] = await db.query("DELETE FROM plataformas WHERE id = ?", [id]);
  if (result.affectedRows > 0) {
    res.json({ message: "Plataforma eliminada" });
  } else {
    res.status(404).json({ message: "Plataforma no encontrada" });
  }
});

app.get("/participantes", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM participantes");
  res.json(rows);
});

app.post("/participantes", async (req, res) => {
  const { nombre, plataformas } = req.body;
  const [result] = await db.query(
    "INSERT INTO participantes (nombre) VALUES (?)",
    [nombre]
  );
  const participanteId = result.insertId;

  for (const plataformaId of plataformas) {
    await db.query(
      "INSERT INTO participante_plataformas (participante_id, plataforma_id) VALUES (?, ?)",
      [participanteId, plataformaId]
    );
  }

  res.status(201).json({ id: participanteId, nombre, plataformas });
});

app.put("/participantes/:id/pago", async (req, res) => {
  const { id } = req.params;
  const [result] = await db.query(
    "UPDATE participantes SET pagado = !pagado WHERE id = ?",
    [id]
  );
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
