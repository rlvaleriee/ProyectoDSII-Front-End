import { useState } from 'react';
import './AdminLayout.css';
import { ClienteLista } from '../components/ClienteLista';
import { EnviosLista } from '../components/EnviosLista'; 
import { UnidadesLista } from '../components/UnidadesLista'; 
import Dashboard from '../components/Dashboard';

export default function AdminLayout() {
  const [view, setView] = useState<'dashboard' | 'clientes' | 'unidades' | 'envios'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleViewChange = (newView: 'dashboard' | 'clientes' | 'unidades' | 'envios') => {
    setView(newView);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <aside className={`sidebar bg-dark text-white p-3 ${sidebarCollapsed ? 'collapsed' : ''}`}>
  <div className="d-flex justify-content-between align-items-center mb-3">
    {!sidebarCollapsed && <h6 className="mb-0">🚚 Transporte Flores</h6>}
    <i
      className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-4 cursor-pointer`}
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
  </nav>
</aside>


      <div className="content flex-grow-1">
        <header className="bg-light p-3 shadow-sm sticky-top">
          <h5 className="mb-0">Panel de Administración</h5>
        </header>

        <main className="p-4">
          {view === 'dashboard' && (
            <div>
              <Dashboard handleViewChange={handleViewChange} /> 
            </div>
          )}

          {view === 'clientes' && (
            <div>
              <h2>Clientes</h2>
              <ClienteLista handleViewChange={handleViewChange} /> 
            </div>
          )}

          {view === 'unidades' && (
            <div>
              <h2>Unidades</h2>
              <UnidadesLista handleViewChange={handleViewChange} /> 
            </div>
          )}

          {view === 'envios' && (
            <div>
              <h2>Envíos</h2>
              <EnviosLista handleViewChange={handleViewChange} /> 
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
