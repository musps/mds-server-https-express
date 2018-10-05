const session = require('express-session');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);
const Tokens = require('csrf');
const tokens = new Tokens();

const SESSION_SECRET = crypto.randomBytes(64).toString('hex');

const otpsRedisStore = {
  host: (process.env.REDIS_HOSTNAME || '127.0.0.1'),
  port: parseInt((process.env.REDIS_POST || 6379), 10)
};

const csrfTools = function csrfTools(req, res, next) {
  // Initialize a new csrf token::
  const initialize = (req, res, next) => {
    const secret = tokens.secretSync();
    try {
      req.session.csrcSecret = secret;
      req.createCSRF = () => (tokens.create(secret));
      next();
    } catch (e) {
      res.send('ERR_CSRF_EMPTY_SESSION');
    }
  };
  // Verify csrf token::
  const verify = (req, res, next) => {
    const secret = req.session.csrcSecret || '';
    const token = req.body._csrf || '';

    if (secret === '' || token === '') {
      res.send('ERR_CSRF_EMPTY_TOKEN');
    } else if (!tokens.verify(secret, token)) {
      res.send('ERR_CSRF_EXPIRED');
    } else {
      return initialize(req, res, next);
    }
  };

  // Handler::
  return (req.method === 'POST'
    ? verify(req, res, next)
    : initialize(req, res, next)
  );
}


const errorHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((onError) => {
    res.json({
      code: null,
      message: onError.message
    });
  });
};

const middlewares = (app) => {
  app.use(cors({
    origin: (process.env.APP_HOSTNAME || 'localhost'),
    methods: 'GET,POST'
  }));

  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ['*'],
      upgradeInsecureRequests: true
    }
  }));

  app.use(helmet.frameguard({ action: 'deny' }));
  //app.use(helmet.noSniff());
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
  app.use(helmet.ieNoOpen());
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(session({
    store: new RedisStore(otpsRedisStore),
    name: 'SSID',
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      domain: (process.env.APP_HOSTNAME || 'localhost'),
      path: '/'
    }
  }));

  app.use(cookieParser());
  app.use(csrfTools);
}

module.exports = {
  use: (app) => (middlewares(app)),
  errorHandler
};
