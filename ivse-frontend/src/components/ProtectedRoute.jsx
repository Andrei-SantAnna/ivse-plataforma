// src/components/ProtectedRoute.jsx

import {
  Navigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';


export default function ProtectedRoute({
  children,
  perfis
}) {

  const {
    autenticado,
    carregando,
    usuario
  } = useAuth();


  if (carregando) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-100
        "
      >

        <p
          className="
            text-gray-500
          "
        >
          Verificando sessão...
        </p>

      </div>

    );

  }


  if (!autenticado) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  if (
    Array.isArray(perfis) &&
    perfis.length > 0 &&
    !perfis.includes(
      usuario?.perfil
    )
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  return children;

}