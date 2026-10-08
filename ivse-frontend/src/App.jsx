import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import {
  AuthProvider
} from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Simulacao from './pages/simulacao';
import Municipios from './pages/Municipios';
import Indicadores from './pages/Indicadores';
import Mapa from './pages/Mapa';
import Comparacao from './pages/Comparacao';
import Login from './pages/Login';


export default function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* LOGIN */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* SISTEMA PROTEGIDO */}

          <Route
            path="/"
            element={

              <ProtectedRoute>

                <Layout />

              </ProtectedRoute>

            }
          >

            <Route
              index
              element={
                <Dashboard />
              }
            />


            <Route
              path="mapa"
              element={
                <Mapa />
              }
            />


            <Route
              path="municipios"
              element={
                <Municipios />
              }
            />


            <Route
              path="indicadores"
              element={
                <Indicadores />
              }
            />


            <Route
              path="simulacao"
              element={
                <Simulacao />
              }
            />


            <Route
              path="comparacao"
              element={
                <Comparacao />
              }
            />

          </Route>


        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}