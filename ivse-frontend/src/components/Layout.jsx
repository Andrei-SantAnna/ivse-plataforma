import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, MapPin, BarChart3, Settings, Activity } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Activity size={20} /> },
    { name: 'Mapa de Vulnerabilidade', path: '/mapa', icon: <Map size={20} /> },
    { name: 'Municípios', path: '/municipios', icon: <MapPin size={20} /> },
    { name: 'Indicadores', path: '/indicadores', icon: <BarChart3 size={20} /> },
    { name: 'Simulação TOPSIS', path: '/simulacao', icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">Plataforma IVSE</h1>
          <p className="text-xs text-slate-400 mt-1">Engenharia de Computação</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Plataforma IVSE'}
          </h2>
        </header>
        
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}