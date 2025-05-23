export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Contenido principal */}
      <div
        style={{
          filter: sidebarOpen ? 'brightness(0.7)' : 'none',
          transition: 'filter 0.3s',
          minHeight: '100vh',
          padding: '1rem',
        }}
      >
        <header className="bg-light p-4 shadow-sm sticky-top">
          <h5 className="mb-0">Panel de Administración</h5>
          <button onClick={() => setSidebarOpen(true)} className="btn btn-primary mt-2">
            Abrir menú
          </button>
        </header>

        <main>
          {/* Aquí tu contenido */}
        </main>
      </div>
    </>
  );
}
