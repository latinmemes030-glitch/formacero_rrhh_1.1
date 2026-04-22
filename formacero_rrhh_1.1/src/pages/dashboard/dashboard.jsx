import React, { useEffect, useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
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

  // 📊 DATA
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
        <Link to="/reportes" className="menu-btn">Reportes</Link>
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

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Formacero RRHH | Política de Privacidad | Soporte
      </footer>

    </div>
  );
}

export default Dashboard;