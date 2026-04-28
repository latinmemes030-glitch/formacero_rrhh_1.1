import { db } from "../db.js";

export const crearReporte = (req, res) => {
  const { empleado_id, descripcion } = req.body;

  const sql = `
    INSERT INTO reportes (empleado_id, descripcion, fecha)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [empleado_id, descripcion, fecha || new Date()], (err) => {
    if (err) return res.status(500).json(err);
    res.json("Reporte creado");
  });
};