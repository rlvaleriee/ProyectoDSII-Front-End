import { useState } from 'react';
import './AdminLayout.css';
import { ClienteLista } from '../components/ClienteLista';
import { EnviosLista } from '../components/EnviosLista'; 
import { UnidadesLista } from '../components/UnidadesLista'; 
import { UsuarioLista } from '../components/UsuarioLista';  
import { ConductoreLista } from '../components/ConductoresLista';
import { MantenimientoLista } from '../components/MantenimientoLista';
import { FacturacionLista } from '../components/FacturacionLista'; 
import Mapa from '../components/Ruta';
import Dashboard from '../components/Dashboard';

export default function AdminLayout() {
  const [view, setView] = useState<
    'dashboard' | 'clientes' | 'unidades' | 'envios' | 'usuarios' | 'conductores' | 'mantenimiento' | 'facturacion'| 'rutas' 
  >('dashboard');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleViewChange = (newView: typeof view) => {
    setView(newView);
  };

  return (
    <div className="d-flex m-0 p-0" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={`sidebar bg-dark text-white p-3 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {!sidebarCollapsed && <h6 className="mb-0">🚚 Transporte Flores</h6>}
          <i
            className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-3 cursor-pointer`}
            role="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Colapsar/Expandir"
          ></i>
        </div>

        <nav className="nav flex-column">
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('dashboard')}>
            <i className="bi bi-speedometer2 me-2"></i>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('clientes')}>
            <i className="bi bi-people-fill me-2"></i>
            {!sidebarCollapsed && <span>Clientes</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('unidades')}>
            <i className="bi bi-truck-front-fill me-2"></i>
            {!sidebarCollapsed && <span>Unidades</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('envios')}>
            <i className="bi bi-send-check-fill me-2"></i>
            {!sidebarCollapsed && <span>Envíos</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('usuarios')}>
            <i className="bi bi-person-lines-fill me-2"></i>
            {!sidebarCollapsed && <span>Usuarios</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('conductores')}>
            <i className="bi bi-person-check-fill me-2"></i>
            {!sidebarCollapsed && <span>Conductores</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('mantenimiento')}>
            <i className="bi bi-tools me-2"></i>
            {!sidebarCollapsed && <span>Mantenimiento</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('facturacion')}>
            <i className="bi bi-receipt-cutoff me-2"></i>
            {!sidebarCollapsed && <span>Facturación</span>}
          </button>
          <button className="nav-link text-white d-flex align-items-center" onClick={() => handleViewChange('rutas')}>
            <i className="bi bi-map me-2"></i>
            {!sidebarCollapsed && <span>Rutas</span>}
          </button>

        </nav>
      </aside>

      {/* Contenedor principal */}
      <div className="d-flex flex-column flex-grow-1" style={{ minHeight: '100vh' }}>
        <header className="bg-light p-4 shadow-sm sticky-top" style={{ zIndex: 10 }}>
          <h5 className="mb-0">Panel de Administración</h5>
        </header>

        <main className="p-4 flex-grow-1 overflow-auto">
          {view === 'dashboard' && <Dashboard handleViewChange={handleViewChange} />}
          {view === 'clientes' && <ClienteLista handleViewChange={handleViewChange} />}
          {view === 'unidades' && <UnidadesLista handleViewChange={handleViewChange} />}
          {view === 'envios' && <EnviosLista handleViewChange={handleViewChange} />}
          {view === 'usuarios' && <UsuarioLista handleViewChange={handleViewChange} />}
          {view === 'conductores' && <ConductoreLista handleViewChange={handleViewChange} />}
          {view === 'mantenimiento' && <MantenimientoLista handleViewChange={handleViewChange} />}
          {view === 'facturacion' && <FacturacionLista handleViewChange={handleViewChange} />}
          {view === 'rutas' && <Mapa handleViewChange={handleViewChange} />}
        </main>
      </div>
    </div>
  );
}
