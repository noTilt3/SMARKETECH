const pool = require("../config/database");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middleware/auth");

async function register(req, res) {
  const { nome, email, senha, dtnasc } = req.body;
  try {
    const existingUser = await pool.query("SELECT * FROM adms WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      "INSERT INTO adms (nome, email, senha, dtnasc, dtcad) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, nome, email",
      [nome, email, hashedPassword, dtnasc]
    );

    const newUser = result.rows[0];
    const token = generateToken({ id: newUser.id, email: newUser.email });
    return res.json({ message: "Usuário registrado com sucesso", user: newUser, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const result = await pool.query("SELECT * FROM adms WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = generateToken({ id: user.id, email: user.email });
    return res.json({
      message: "Login realizado com sucesso",
      token,
      user: { id: user.id, nome: user.nome, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
}

function validate(req, res) {
  return res.json({ message: "Token válido", user: req.user });
}

module.exports = { register, login, validate };

