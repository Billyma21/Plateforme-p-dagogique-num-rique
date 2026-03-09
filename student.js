function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.session.userId || req.session.role !== 'student') {
    return res.redirect('/login');
  }
  next();
}

function requireTrainer(req, res, next) {
  if (!req.session.userId || !['trainer', 'admin'].includes(req.session.role)) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
}

module.exports = { requireAuth, requireStudent, requireTrainer, requireAdmin };
