module.exports = function (router, passport, db) {
  router.get('/', function (req, res) {
    res.render('main', { title: 'Exzume' });
  });

  router.get('/signin', function (req, res) {
    res.render('signin', { message: req.flash(signinMessage), user: req.user });
    console.log(req.flash('signinMessage'));
  });

  router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
  }));

  router.get('/register', function (req, res) {
    res.render('register', { message: req.flash('signupMessage'), user: req.user });
    console.log(req.flash('signupMessage'));
  });

  router.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/secure',
    failureRedirect: '/',
    failureFlash: true,
  }));

  router.get('/api/session', function (req, res) {
    res.json({ username: req.user.local.username });
  });

  router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
};
