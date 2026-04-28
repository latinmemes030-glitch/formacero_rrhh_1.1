import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchWithAuth } from "../../utils/api";
import "./reportes.css";

function Reportes() {

  const [reportes,setReportes] = useState([]);

  // 🔐 OBTENER REPORTES DESDE BACKEND
  useEffect(() => {
    async function cargarReportes(){
      try {

        const token = localStorage.getItem("token");

        const res = await fetchWithAuth("/reportes");

        const data = await res.json();

        if(!res.ok){
          throw new Error(data.message || "Error al cargar reportes");
        }

        setReportes(data);

      } catch (error) {
        console.error(error);
      }
    }

    cargarReportes();
  }, []);

  // 🔄 CAMBIAR ESTADO (OPCIONAL BACKEND)
  async function cambiarEstado(id){

    try {

      const token = localStorage.getItem("token");

      const res = await fetchWithAuth(`/reportes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado, decision: reporteActual.decision || "" })
      });

      if (!res.ok) {
        throw new Error("Error al actualizar estado");
      }

      fetchReportes();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateReporte(e) {
    e.preventDefault();
    console.log("Creando reporte con:", formData);
    try {
      const payload = {
        empleado_id: Number(formData.empleado_id),
        descripcion: formData.descripcion,
        fecha: formData.fecha
      };
      console.log("Payload:", payload);

      const res = await fetchWithAuth("/reportes", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      console.log("Respuesta POST:", res.status, res.ok);

      if (res.ok) {
        setFormData({ empleado_id: '', descripcion: '', fecha: '' });
        await fetchReportes();
        setActiveTab("reportes");
      }
    } catch (error) {
      console.error("Error creando reporte:", error);
    }
  }

  function startEdit(reporte) {
    setEditingReport(reporte);
    setEditDecision(reporte.decision || "");
    setEditEstado(reporte.estado || "pendiente");
  }

  async function saveEdit() {
    if (!editingReport) return;
    try {
      const res = await fetchWithAuth(`/reportes/${editingReport.id}`, {
        method: "PUT",
        body: JSON.stringify({ estado: editEstado, decision: editDecision })
      });
      if (res.ok) {
        setEditingReport(null);
        fetchReportes();
      }
    } catch (error) {
      console.error("Error guardando reporte:", error);
    }
  }

  async function deleteReporte(id) {
    if (!window.confirm("¿Eliminar este reporte?")) return;
    try {
      const res = await fetchWithAuth(`/reportes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchReportes();
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    }
  }

  return (
    <div className="reportes-principal">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar empleados, cargos o documentos..."
          />
        </div>
        <Link to="/dashboard" className="back-btn">← Volver al Panel</Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Reportes de Conducta y Accidentes</h1>
        <p>Visualiza y gestiona los reportes registrados por la organización</p>
      </section>

      {/* CONTENIDO */}
      <div className="contenedor-reportes">
        <div className="grid-reportes">
          {reportes.map((rep)=> (
            <div key={rep.id} className="tarjeta">
              <h3>{rep.empleado}</h3>
              <div className="fecha">{rep.fecha}</div>
              <div className="descripcion">{rep.descripcion}</div>
              <div className="decision"><strong>Decisión:</strong> {rep.decision}</div>
              <div className="estado">
                <button
                  className={rep.estado === "resuelto" ? "btn-resuelto" : "btn-pendiente"}
                  onClick={()=>cambiarEstado(rep.id)}
                >
                  {rep.estado === "resuelto" ? "Resuelto" : "Pendiente"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Formacero. Todos los derechos reservados.
      </footer>

    </div>
  );
}

export default Reportes;