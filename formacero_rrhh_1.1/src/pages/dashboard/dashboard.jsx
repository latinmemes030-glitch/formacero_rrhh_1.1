import React, { useEffect, useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { API, fetchWithAuth } from "../../utils/api";
import "../../layout.css";
import "./dashboard.css";

function Dashboard() {

  const navigate = useNavigate();
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [cumpleaneros, setCumpleaneros] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Reportes states (solo para admins)
  const [reportes, setReportes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({ empleado_id: '', descripcion: '', fecha: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ estado: '', decision: '' });

  // ✅ TOKEN
  const token = localStorage.getItem("token");

  // 👤 USUARIO
  const user = JSON.parse(localStorage.getItem("user"));
  const firstName = user?.nombre?.trim()?.split(" ")[0] || "Usuario";

  console.log("Usuario logueado:", user); // Depuración

  // 🔒 LOGOUT
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // 🔍 BUSCADOR
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`${API}/empleados/search?q=${value}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setResults([]);
        return;
      }

      setResults(data);
      setShowDropdown(true);

    } catch (error) {
      console.error("Error buscando:", error);
      setResults([]);
    }
  };

  // � FUNCIONES REPORTES (solo admins)
  const fetchReportes = async () => {
    try {
      const res = await fetchWithAuth("/reportes");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setReportes(data); else setReportes([]);
    } catch (error) {
      console.error("Error fetching reportes:", error);
      setReportes([]);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await fetchWithAuth("/empleados");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setEmpleados(data); else setEmpleados([]);
    } catch (error) {
      console.error("Error fetching empleados:", error);
      setEmpleados([]);
    }
  };

  const handleCreateReporte = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth("/reportes", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ empleado_id: '', descripcion: '', fecha: '' });
        fetchReportes();
      }
    } catch (error) {
      console.error("Error creando reporte:", error);
    }
  };

  const handleEditReporte = (reporte) => {
    setEditingId(reporte.id);
    setEditData({ estado: reporte.estado, decision: reporte.decision || '' });
  };

  const handleUpdateReporte = async () => {
    try {
      const res = await fetchWithAuth(`/reportes/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setEditingId(null);
        setEditData({ estado: '', decision: '' });
        fetchReportes();
      }
    } catch (error) {
      console.error("Error actualizando reporte:", error);
    }
  };

  const handleDeleteReporte = async (id) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    try {
      const res = await fetchWithAuth(`/reportes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchReportes();
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    }
  };

  // �📊 DATA
  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    const getTotal = async () => {
      try {
        const res = await fetch(`${API}/empleados/count`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          setTotalEmpleados(0);
          return;
        }

        setTotalEmpleados(data.total || 0);

      } catch (error) {
        console.error("Error total empleados:", error);
        setTotalEmpleados(0);
      }
    };

    const getCumpleaneros = async () => {
      try {
        const res = await fetch(`${API}/empleados/cumpleaneros`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          setCumpleaneros([]);
          return;
        }

        setCumpleaneros(data);

      } catch (error) {
        console.error("Error cumpleaños:", error);
        setCumpleaneros([]);
      }
    };

    getTotal();
    getCumpleaneros();

    if (user?.rol === "admin") {
      fetchEmpleados();
      fetchReportes();
    }

  }, [token, navigate]);

  return (
    <div className="app-container">

      {/* HEADER */}
      <header className="header">
        <div className="logo">Formacero</div>

        <div className="search-bar" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar empleados..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />

          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map(emp => (
                <div
                  key={emp.id}
                  className="search-item"
                  onMouseDown={() => navigate(`/empleado/${emp.id}`)}
                >
                  <strong>{emp.nombre}</strong>
                  <p>{emp.cargo || emp.correo || "Empleado"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👤 USER + LOGOUT */}
        <div className="user-profile">
          <Link to={`/empleado/${user?.empleado_id || user?.id}`} className="user-link">
            <img src="https://i.pravatar.cc/40" alt="Usuario"/>
            <span>{firstName}</span>
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M10 17l5-5-5-5v3H3v4h7v3zm9-14H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">⚠️</div>
            <h2>¿Cerrar sesión?</h2>
            <p>Confirma si deseas salir de tu cuenta. Se cerrará tu sesión actual.</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel" onClick={cancelLogout}>
                Cancelar
              </button>
              <button className="confirm-btn confirm" onClick={confirmLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <h1>Panel de Gestión de Recursos Humanos</h1>
      </section>

      {/* MENÚ */}
      <nav className="main-menu">
        <Link to="/organizacion" className="menu-btn">Organización</Link>
        <Link to="/informacion-empleados" className="menu-btn">Empleados</Link>
        <Link to="/lista-exempleados" className="menu-btn">Lista Exempleados</Link>
        <Link to="/nomina" className="menu-btn">Nómina</Link>
        <Link to="/registrar-empleados" className="menu-btn">Registro de Empleados</Link>
        <Link to="/certificado-laboral" className="menu-btn">Certificado Laboral</Link>
        <Link to="/vacaciones" className="menu-btn">Vacaciones</Link>
        {user?.rol === "admin" && <Link to="/reportes" className="menu-btn">Reportes</Link>}
      </nav>

      {/* CONTENIDO */}
      <main className="dashboard-content">

        <div className="card">
          <h3>Total Empleados</h3>
          <p>{totalEmpleados}</p>
        </div>

        <div className="card">
          <h3>Nuevas Contrataciones</h3>
          <p>8</p>
        </div>

        <div className="card">
          <h3>Vacaciones Activas</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Cumpleaños del Mes</h3>
          <p>{cumpleaneros.length}</p>

          <div style={{ fontSize: "0.85rem", marginTop: "5px" }}>
            {cumpleaneros.length === 0 ? (
              <p>No hay cumpleaños</p>
            ) : (
              cumpleaneros.map(emp => {
                const fecha = new Date(emp.fecha_nacimiento);
                const opciones = { day: "2-digit", month: "long" };
                const fechaFormateada = fecha.toLocaleDateString("es-CO", opciones);

                return (
                  <p key={emp.id}>
                    {emp.nombre} - {fechaFormateada}
                  </p>
                );
              })
            )}
          </div>
        </div>

        <div className="card alert">
          <h3>Alertas Pendientes</h3>
          <p>3</p>
        </div>

      </main>

      {/* SECCIÓN REPORTES (solo admins) */}
      {user?.rol === "admin" && (
        <section className="reportes-admin-section">
          <h2>Gestión de Reportes</h2>
          
          {/* Formulario para crear reporte */}
          <div className="reportes-form">
            <h3>Crear Nuevo Reporte</h3>
            <form onSubmit={handleCreateReporte}>
              <select
                value={formData.empleado_id}
                onChange={(e) => setFormData({...formData, empleado_id: e.target.value})}
                required
              >
                <option value="">Seleccionar Empleado</option>
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
              <textarea
                placeholder="Descripción del reporte"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
              />
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
              />
              <button type="submit">Crear Reporte</button>
            </form>
          </div>

          {/* Lista de reportes */}
          <div className="reportes-list">
            <h3>Reportes Existentes</h3>
            {reportes.length === 0 ? (
              <p>No hay reportes</p>
            ) : (
              reportes.map(reporte => (
                <div key={reporte.id} className="reporte-item">
                  <div className="reporte-info">
                    <p><strong>Empleado:</strong> {reporte.empleado}</p>
                    <p><strong>Fecha:</strong> {new Date(reporte.fecha).toLocaleDateString()}</p>
                    <p><strong>Descripción:</strong> {reporte.descripcion}</p>
                    <p><strong>Estado:</strong> {reporte.estado}</p>
                    {reporte.decision && <p><strong>Decisión:</strong> {reporte.decision}</p>}
                  </div>
                  <div className="reporte-actions">
                    <button onClick={() => handleEditReporte(reporte)}>Editar</button>
                    <button onClick={() => handleDeleteReporte(reporte.id)}>Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal de edición */}
          {editingId && (
            <div className="edit-modal">
              <div className="edit-content">
                <h3>Editar Reporte</h3>
                <select
                  value={editData.estado}
                  onChange={(e) => setEditData({...editData, estado: e.target.value})}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="resuelto">Resuelto</option>
                </select>
                <textarea
                  placeholder="Decisión"
                  value={editData.decision}
                  onChange={(e) => setEditData({...editData, decision: e.target.value})}
                />
                <div className="edit-actions">
                  <button onClick={handleUpdateReporte}>Guardar</button>
                  <button onClick={() => setEditingId(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Formacero RRHH | Política de Privacidad | Soporte
      </footer>

    </div>
  );
}

export default Dashboard;