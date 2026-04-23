import { db } from "../db.js";

export const crearReporte = (req, res) => {
  const { empleado_id, descripcion, fecha } = req.body;

  const sql = `
    INSERT INTO reportes (empleado_id, descripcion, fecha)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [empleado_id, descripcion, fecha || new Date()], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte creado");
  });
};

export const getReportes = (req, res) => {
  console.log("GET /reportes called");
  const sql = "SELECT * FROM reportes";

  db.query(sql, (err, data) => {
    console.log("Data from db:", data);
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const updateReporte = (req, res) => {
  const { id } = req.params;
  const { estado, decision } = req.body;

  const sql = `
    UPDATE reportes
    SET estado = ?, decision = ?
    WHERE id = ?
  `;

  db.query(sql, [estado, decision, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte actualizado");
  });
};

export const deleteReporte = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM reportes WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte eliminado");
  });
};