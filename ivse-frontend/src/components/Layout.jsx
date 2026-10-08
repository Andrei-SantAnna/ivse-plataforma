import {
  Outlet,
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Map,
  MapPin,
  BarChart3,
  Settings,
  Activity,
  GitCompareArrows,
  LogOut,
  ShieldCheck,
  User,
  FileText
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext';


export default function Layout() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    usuario,
    logout
  } = useAuth();


  // ============================================================
  // PERMISSÕES DOS PERFIS
  // ============================================================

  const permissoes = {

    administrador: [
      '/',
      '/mapa',
      '/municipios',
      '/indicadores',
      '/simulacao',
      '/comparacao',
      '/relatorios'
    ],

    pesquisador: [
      '/',
      '/mapa',
      '/municipios',
      '/indicadores',
      '/simulacao',
      '/comparacao',
      '/relatorios'
    ],

    gestor: [
      '/',
      '/mapa',
      '/comparacao',
      '/relatorios'
    ]

  };


  // ============================================================
  // ITENS DO MENU
  // ============================================================

  const todosNavItems = [

    {
      name: 'Dashboard',
      path: '/',
      icon: <Activity size={20} />
    },

    {
      name: 'Mapa de Vulnerabilidade',
      path: '/mapa',
      icon: <Map size={20} />
    },

    {
      name: 'Municípios',
      path: '/municipios',
      icon: <MapPin size={20} />
    },

    {
      name: 'Indicadores',
      path: '/indicadores',
      icon: <BarChart3 size={20} />
    },

    {
      name: 'Simulação TOPSIS',
      path: '/simulacao',
      icon: <Settings size={20} />
    },

    {
      name: 'Comparação',
      path: '/comparacao',
      icon: <GitCompareArrows size={20} />
    },

    {
      name: 'Relatórios',
      path: '/relatorios',
      icon: <FileText size={20} />
    }

  ];


  const caminhosPermitidos =
    permissoes[
      usuario?.perfil
    ] || [];


  const navItems =
    todosNavItems.filter(
      item =>
        caminhosPermitidos.includes(
          item.path
        )
    );


  // ============================================================
  // FORMATAR PERFIL
  // ============================================================

  const nomePerfil = {

    administrador:
      'Administrador',

    pesquisador:
      'Pesquisador',

    gestor:
      'Gestor'

  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const sair = () => {

    logout();

    navigate(
      '/login',
      {
        replace: true
      }
    );

  };


  return (

    <div
      className="
        flex
        h-screen
        bg-gray-100
        font-sans
      "
    >

      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <aside
        className="
          w-64
          bg-slate-900
          text-white
          flex
          flex-col
        "
      >

        {/* LOGO / TÍTULO */}

        <div
          className="
            p-6
            border-b
            border-slate-800
          "
        >

          <h1
            className="
              text-2xl
              font-bold
              text-blue-400
            "
          >
            Plataforma IVSE
          </h1>


          <p
            className="
              text-xs
              text-slate-400
              mt-1
            "
          >
            Engenharia de Computação
          </p>

        </div>


        {/* ==================================================== */}
        {/* USUÁRIO LOGADO */}
        {/* ==================================================== */}

        <div
          className="
            px-4
            py-4
            border-b
            border-slate-800
          "
        >

          <div
            className="
              bg-slate-800
              rounded-lg
              p-3
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                "
              >

                <User
                  size={20}
                />

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-white
                    truncate
                  "
                >
                  {usuario?.email}
                </p>


                <div
                  className="
                    flex
                    items-center
                    gap-1
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >

                  <ShieldCheck
                    size={13}
                  />


                  <span>

                    {
                      nomePerfil[
                        usuario?.perfil
                      ] ||
                      usuario?.perfil
                    }

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================== */}
        {/* MENU */}
        {/* ==================================================== */}

        <nav
          className="
            flex-1
            px-4
            space-y-2
            mt-4
            overflow-y-auto
          "
        >

          {navItems.map(
            item => {

              const isActive =
                location.pathname ===
                item.path;


              return (

                <Link

                  key={
                    item.name
                  }

                  to={
                    item.path
                  }

                  className={`
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    transition-colors

                    ${
                      isActive

                        ? 'bg-blue-600 text-white'

                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >

                  {item.icon}


                  <span
                    className="
                      font-medium
                    "
                  >
                    {item.name}
                  </span>

                </Link>

              );

            }
          )}

        </nav>


        {/* ==================================================== */}
        {/* LOGOUT */}
        {/* ==================================================== */}

        <div
          className="
            p-4
            border-t
            border-slate-800
          "
        >

          <button

            onClick={
              sair
            }

            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-lg
              text-slate-300
              hover:bg-red-600
              hover:text-white
              transition-colors
            "
          >

            <LogOut
              size={20}
            />


            <span
              className="
                font-medium
              "
            >
              Sair
            </span>

          </button>

        </div>

      </aside>


      {/* ====================================================== */}
      {/* CONTEÚDO */}
      {/* ====================================================== */}

      <main
        className="
          flex-1
          overflow-y-auto
        "
      >

        {/* HEADER */}

        <header
          className="
            bg-white
            shadow-sm
            px-8
            py-4
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <h2
            className="
              text-xl
              font-semibold
              text-gray-800
            "
          >

            {
              todosNavItems.find(
                item =>
                  item.path ===
                  location.pathname
              )?.name ||
              'Plataforma IVSE'
            }

          </h2>


          <div
            className="
              text-right
              hidden
              md:block
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              {usuario?.email}
            </p>


            <p
              className="
                text-xs
                text-gray-400
              "
            >

              {
                nomePerfil[
                  usuario?.perfil
                ] ||
                usuario?.perfil
              }

            </p>

          </div>

        </header>


        {/* PÁGINAS */}

        <div
          className="
            p-8
          "
        >

          <Outlet />

        </div>

      </main>

    </div>

  );

}