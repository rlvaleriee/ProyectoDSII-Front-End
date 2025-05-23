// src/layout/Sidebar.tsx
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: '250px' }}>
      <h3 className="mb-4 text-nowrap overflow-hidden text-truncate">
        🚛Transporte Flores
      </h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-white">Inicio</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/clientes" className="nav-link text-white">Clientes</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/envios" className="nav-link text-white">Envíos</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/unidades" className="nav-link text-white">Unidades</Link>
        </li>
      </ul>
    </div>
  );
}
