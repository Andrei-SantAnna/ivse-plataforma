// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import api from '../services/api';


const AuthContext =
  createContext(null);


export function AuthProvider({
  children
}) {

  const [usuario, setUsuario] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);


  // ============================================================
  // RECUPERAR SESSÃO
  // ============================================================

  useEffect(() => {

    const recuperarSessao =
      async () => {

        const token =
          localStorage.getItem(
            'ivse_token'
          );


        if (!token) {

          setCarregando(false);

          return;

        }


        try {

          const resposta =
            await api.get(
              '/auth/me'
            );


          setUsuario(
            resposta.data
          );


          localStorage.setItem(
            'ivse_usuario',
            JSON.stringify(
              resposta.data
            )
          );


        } catch (erro) {

          console.error(
            'Sessão inválida:',
            erro
          );


          localStorage.removeItem(
            'ivse_token'
          );

          localStorage.removeItem(
            'ivse_usuario'
          );

          setUsuario(null);

        } finally {

          setCarregando(false);

        }

      };


    recuperarSessao();

  }, []);


  // ============================================================
  // LOGIN
  // ============================================================

  const login =
    async (
      email,
      senha
    ) => {

      const resposta =
        await api.post(
          '/auth/login',
          {
            email,
            senha
          }
        );


      const {
        token,
        usuario
      } = resposta.data;


      localStorage.setItem(
        'ivse_token',
        token
      );


      localStorage.setItem(
        'ivse_usuario',
        JSON.stringify(
          usuario
        )
      );


      setUsuario(
        usuario
      );


      return usuario;

    };


  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {

    localStorage.removeItem(
      'ivse_token'
    );

    localStorage.removeItem(
      'ivse_usuario'
    );


    setUsuario(null);

  };


  // ============================================================
  // PERFIL
  // ============================================================

  const possuiPerfil =
    (...perfis) => {

      if (!usuario) {
        return false;
      }


      return perfis.includes(
        usuario.perfil
      );

    };


  return (

    <AuthContext.Provider
      value={{
        usuario,
        carregando,

        autenticado:
          Boolean(usuario),

        login,
        logout,
        possuiPerfil
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const contexto =
    useContext(
      AuthContext
    );


  if (!contexto) {

    throw new Error(
      'useAuth deve ser usado dentro de AuthProvider.'
    );

  }


  return contexto;

}