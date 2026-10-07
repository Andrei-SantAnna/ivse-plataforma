const jwt = require('jsonwebtoken');


// ============================================================
// AUTENTICAR TOKEN
// ============================================================

exports.autenticar = (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;


    if (!authHeader) {

      return res.status(401).json({
        erro: 'Token de autenticação não informado.'
      });

    }


    const partes =
      authHeader.split(' ');


    if (
      partes.length !== 2 ||
      partes[0] !== 'Bearer'
    ) {

      return res.status(401).json({
        erro: 'Formato de token inválido.'
      });

    }


    const token =
      partes[1];


    const dados =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    req.usuario = {
      id: dados.id,
      email: dados.email,
      perfil: dados.perfil
    };


    next();


  } catch (erro) {

    if (
      erro.name ===
      'TokenExpiredError'
    ) {

      return res.status(401).json({
        erro: 'Token expirado.'
      });

    }


    return res.status(401).json({
      erro: 'Token inválido.'
    });

  }

};


// ============================================================
// AUTORIZAR PERFIS
// ============================================================

exports.autorizarPerfis =
  (...perfisPermitidos) => {

    return (req, res, next) => {

      if (!req.usuario) {

        return res.status(401).json({
          erro: 'Usuário não autenticado.'
        });

      }


      if (
        !perfisPermitidos.includes(
          req.usuario.perfil
        )
      ) {

        return res.status(403).json({
          erro:
            'Você não possui permissão para acessar este recurso.'
        });

      }


      next();

    };

  };