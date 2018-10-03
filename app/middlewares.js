const session = require('express-session');
const crypto = require('crypto');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const RedisStore = require('connect-redis')(session);

const SESSION_SECRET = crypto.randomBytes(64).toString('hex');

const otpsRedisStore = {
  host: (process.env.REDIS_HOSTNAME || '127.0.0.1'),
  port: (process.env.REDIS_POST || 6379);
};

const middlewares = (app) => {
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
  app.use(csurf({ cookie: true }));
}

module.exports = {
  use: (app) => (middlewares(app))
};
