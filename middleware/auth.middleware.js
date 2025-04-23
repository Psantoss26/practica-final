const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requerido' });

  try {
    const token = auth.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
