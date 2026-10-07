import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulacao from './pages/simulacao'; 
import Municipios from './pages/Municipios';
import Indicadores from './pages/Indicadores';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapa" element={<div className="p-4 text-gray-500">Página do Mapa em construção...</div>} />
          <Route path="municipios" element={<Municipios />} />
          <Route path="indicadores" element={<Indicadores />} />
          {/* Ligar a rota ao novo componente */}
          <Route path="simulacao" element={<Simulacao />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}