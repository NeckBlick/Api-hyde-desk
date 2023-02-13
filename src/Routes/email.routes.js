const express = require("express");
const routes = express.Router();
const db = require("../../conexao");
const nodemailer = require("nodemailer");

routes.post("/", async (req, res) => {
  const frommail = "hydedesk@gmail.com";
  const password = "senai115";
  const tomail = req.body.email;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(401).send({ erro: error, message: "Algo deu errado!" });
    }
    let query = "SELECT * FROM tecnicos WHERE email = ?";

    conn.query(query, [tomail], async (error, result, field) => {
      if (error)
        return res
          .status(401)
          .send({ erro: error, message: "Algo deu errado!" });

      if (result.length > 0) {
        var randomized = Math.ceil(Math.random() * Math.pow(10, 6)); //Cria um n�mero aleat�rio do tamanho definido em size.
        var digito = Math.ceil(Math.log(randomized)); //Cria o d�gito verificador inicial
        while (digito > 10) {
          //Pega o digito inicial e vai refinando at� ele ficar menor que dez
          digito = Math.ceil(Math.log(digito));
        }
        var senhaNova = randomized + "R" + digito + "s";

        const transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: "aa6862bb9aeccb",
            pass: "cb1929569ca243",
          },
        });

        // transporter.verify((error, success) => {
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     console.log(success);
        //   }
        // });

        const mailOptions = {
          from: frommail,
          to: tomail,
          subject: "Recuperação de senha",
          text: `Olá ${result[0].nome}`,
          html: "<p>Olá</p>",
        };

        console.log(transporter);
        console.log(mailOptions);

        transporter.sendMail(mailOptions, async (error) => {
          if (error) {
            return res.status(401).send({
              error: error,
              message:
                "Não foi possível enviar seu email. Tente novamente mais tarde!",
            });
          }
        });

        return res.status(201).send({ message: "Email enviado com sucesso!" });
      } else {
        return res
          .status(404)
          .send({ message: "Email não cadastrado no sistema!" });
      }
    });
  });
});

module.exports = routes;
