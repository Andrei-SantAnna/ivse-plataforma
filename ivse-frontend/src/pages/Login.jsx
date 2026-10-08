// src/pages/Login.jsx

import {
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  LogIn,
  LockKeyhole,
  Mail,
  AlertCircle
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext';


export default function Login() {

  const navigate =
    useNavigate();


  const {
    login
  } = useAuth();


  const [email, setEmail] =
    useState(
      'admin@ivse.com'
    );

  const [senha, setSenha] =
    useState('');

  const [erro, setErro] =
    useState(null);

  const [carregando, setCarregando] =
    useState(false);


  const enviar =
    async event => {

      event.preventDefault();

      setErro(null);


      if (
        !email.trim() ||
        !senha
      ) {

        setErro(
          'Informe o e-mail e a senha.'
        );

        return;

      }


      try {

        setCarregando(true);


        await login(
          email.trim(),
          senha
        );


        navigate(
          '/',
          {
            replace: true
          }
        );


      } catch (erro) {

        console.error(
          'Erro no login:',
          erro
        );


        setErro(
          erro.response?.data?.erro ||
          'Não foi possível realizar o login.'
        );


      } finally {

        setCarregando(false);

      }

    };


  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        flex
        items-center
        justify-center
        p-4
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
      >

        <div
          className="
            bg-slate-900
            px-8
            py-8
          "
        >

          <h1
            className="
              text-3xl
              font-bold
              text-blue-400
            "
          >
            Plataforma IVSE
          </h1>

          <p
            className="
              text-sm
              text-slate-400
              mt-2
            "
          >
            Vulnerabilidade Social Energética
          </p>

        </div>


        <form
          onSubmit={
            enviar
          }
          className="
            p-8
            space-y-5
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              Acesso ao sistema
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Informe suas credenciais.
            </p>

          </div>


          {erro && (

            <div
              className="
                bg-red-50
                border
                border-red-200
                text-red-700
                rounded-lg
                p-3
                flex
                gap-2
                items-start
              "
            >

              <AlertCircle
                size={18}
                className="mt-0.5"
              />

              <span
                className="
                  text-sm
                "
              >
                {erro}
              </span>

            </div>

          )}


          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-2
              "
            >
              E-mail
            </label>


            <div
              className="
                relative
              "
            >

              <Mail
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />


              <input

                type="email"

                required

                value={
                  email
                }

                onChange={
                  e =>
                    setEmail(
                      e.target.value
                    )
                }

                placeholder="usuario@ivse.com"

                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  p-3
                  pl-10
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "

              />

            </div>

          </div>


          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-2
              "
            >
              Senha
            </label>


            <div
              className="
                relative
              "
            >

              <LockKeyhole
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />


              <input

                type="password"

                required

                value={
                  senha
                }

                onChange={
                  e =>
                    setSenha(
                      e.target.value
                    )
                }

                placeholder="Digite sua senha"

                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  p-3
                  pl-10
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "

              />

            </div>

          </div>


          <button

            type="submit"

            disabled={
              carregando
            }

            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              rounded-lg
              py-3
              font-medium
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-60
            "
          >

            <LogIn size={18} />


            {
              carregando
                ? 'Entrando...'
                : 'Entrar'
            }

          </button>

        </form>

      </div>

    </div>

  );

}