const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db =
  require('../config/database');


const PERFIS_VALIDOS = [
  'administrador',
  'pesquisador',
  'gestor'
];


// ============================================================
// LOGIN
// ============================================================

exports.login = async (req, res) => {

  const {
    email,
    senha
  } = req.body;


  try {

    if (
      !email ||
      !senha
    ) {

      return res.status(400).json({
        erro:
          'E-mail e senha são obrigatórios.'
      });

    }


    const emailNormalizado =
      String(email)
        .trim()
        .toLowerCase();


    const usuarioResult =
      await db.query(
        `
        SELECT
          id,
          email,
          senha,
          perfil

        FROM usuarios

        WHERE LOWER(email) = $1
        `,
        [
          emailNormalizado
        ]
      );


    if (
      usuarioResult.rows.length === 0
    ) {

      return res.status(401).json({
        erro:
          'E-mail ou senha inválidos.'
      });

    }


    const usuario =
      usuarioResult.rows[0];


    const senhaCorreta =
      await bcrypt.compare(
        senha,
        usuario.senha
      );


    if (!senhaCorreta) {

      return res.status(401).json({
        erro:
          'E-mail ou senha inválidos.'
      });

    }


    if (
      !PERFIS_VALIDOS.includes(
        usuario.perfil
      )
    ) {

      return res.status(403).json({
        erro:
          'O usuário possui um perfil de acesso inválido.'
      });

    }


    if (
      !process.env.JWT_SECRET
    ) {

      throw new Error(
        'JWT_SECRET não configurado.'
      );

    }


    const token =
      jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );


    return res.status(200).json({

      mensagem:
        'Login realizado com sucesso.',

      token,

      usuario: {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil
      }

    });


  } catch (erro) {

    console.error(
      'Erro no login:',
      erro
    );


    return res.status(500).json({
      erro:
        'Erro interno ao realizar login.'
    });

  }

};


// ============================================================
// DADOS DO USUÁRIO AUTENTICADO
// ============================================================

exports.me = async (req, res) => {

  try {

    const resultado =
      await db.query(
        `
        SELECT
          id,
          email,
          perfil,
          criado_em

        FROM usuarios

        WHERE id = $1
        `,
        [
          req.usuario.id
        ]
      );


    if (
      resultado.rows.length === 0
    ) {

      return res.status(404).json({
        erro:
          'Usuário não encontrado.'
      });

    }


    return res.status(200).json(
      resultado.rows[0]
    );


  } catch (erro) {

    console.error(
      'Erro ao consultar usuário:',
      erro
    );


    return res.status(500).json({
      erro:
        'Erro interno ao consultar usuário.'
    });

  }

};


// ============================================================
// CRIAR USUÁRIO
// SOMENTE ADMINISTRADOR
// ============================================================

exports.criarUsuario =
  async (req, res) => {

    const {
      email,
      senha,
      perfil
    } = req.body;


    try {

      if (
        !email ||
        !senha ||
        !perfil
      ) {

        return res.status(400).json({
          erro:
            'E-mail, senha e perfil são obrigatórios.'
        });

      }


      const emailNormalizado =
        String(email)
          .trim()
          .toLowerCase();


      if (
        !emailNormalizado.includes('@')
      ) {

        return res.status(400).json({
          erro:
            'Informe um e-mail válido.'
        });

      }


      if (
        String(senha).length < 8
      ) {

        return res.status(400).json({
          erro:
            'A senha deve possuir pelo menos 8 caracteres.'
        });

      }


      if (
        !PERFIS_VALIDOS.includes(
          perfil
        )
      ) {

        return res.status(400).json({

          erro:
            'Perfil de usuário inválido.',

          perfis_permitidos:
            PERFIS_VALIDOS

        });

      }


      const senhaHash =
        await bcrypt.hash(
          senha,
          12
        );


      const resultado =
        await db.query(
          `
          INSERT INTO usuarios (
            email,
            senha,
            perfil
          )

          VALUES (
            $1,
            $2,
            $3
          )

          RETURNING
            id,
            email,
            perfil,
            criado_em
          `,
          [
            emailNormalizado,
            senhaHash,
            perfil
          ]
        );


      return res.status(201).json({

        mensagem:
          'Usuário cadastrado com sucesso.',

        usuario:
          resultado.rows[0]

      });


    } catch (erro) {

      console.error(
        'Erro ao cadastrar usuário:',
        erro
      );


      if (
        erro.code === '23505'
      ) {

        return res.status(409).json({
          erro:
            'Já existe um usuário cadastrado com este e-mail.'
        });

      }


      return res.status(500).json({
        erro:
          'Erro interno ao cadastrar usuário.'
      });

    }

  };


// ============================================================
// LISTAR USUÁRIOS
// SOMENTE ADMINISTRADOR
// ============================================================

exports.listarUsuarios =
  async (req, res) => {

    try {

      const resultado =
        await db.query(
          `
          SELECT
            id,
            email,
            perfil,
            criado_em

          FROM usuarios

          ORDER BY
            email ASC
          `
        );


      return res.status(200).json(
        resultado.rows
      );


    } catch (erro) {

      console.error(
        'Erro ao listar usuários:',
        erro
      );


      return res.status(500).json({
        erro:
          'Erro interno ao listar usuários.'
      });

    }

  };