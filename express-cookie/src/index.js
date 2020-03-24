'use strict';

const config = require('config');
const cookieParser = require('cookie-parser');
const death = require('death')({ uncaughtException: true });
const express = require('express');
const expressPinoLogger = require('express-pino-logger');
const helmet = require('helmet');
const mustacheExpress = require('mustache-express');
const path = require('path');
const pino = require('pino');
const stoppable = require('stoppable');

const stopGrace = config.get('stopGrace');
const cookieSecret = config.get('cookie.secret');
const cookieConfig = config.util.toObject(config.get('cookie.settings'));
const loggerConfig = config.util.toObject(config.get('logger'));
const expressConfig = config.util.toObject(config.get('express'));

const logger = pino(loggerConfig);
const routes = {
  form: '/',
  login: '/login',
  logout: '/logout',
  protected: '/loggedin'
};

// Exposed server
const app = express();

// Settings
app.set('trust proxy', 1);
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.sendStatus(500);
});

// Middleware
app.use(expressPinoLogger({ logger }));
app.use(helmet());
app.use(cookieParser(cookieSecret));

// Root
app.get(routes.form, async (req, res) => {
  if (req.signedCookies.user) {
    res.redirect(302, routes.protected);
  } else {
    res.render('index', { loginUrl: routes.login });
  }
});

const logoutFunc = async (req, res) => {
  const deleteOptions = { ...cookieConfig };
  delete deleteOptions.maxAge;
  delete deleteOptions.expires;
  res.clearCookie('user', deleteOptions);
  res.redirect(302, routes.form);
};
app.get(routes.logout, logoutFunc);
app.post(routes.logout, logoutFunc);

app.post(routes.login, async (req, res) => {
  res.cookie('user', 'user-1', cookieConfig);
  res.redirect(302, routes.protected);
});

// Protected route
app.get(routes.protected, async (req, res) => {
  if (req.signedCookies.user) {
    const userCookie = req.signedCookies.user;
    res.render('loggedin', { userCookie, logoutPath: routes.logout });
  } else {
    res.redirect(302, routes.form);
  }
});

// the Express server
// eslint-disable-next-line prefer-const
let server;

const deathCleanup = death((signal, err) => {
  // Stop accepting connections (including health checks)
  if (server) {
    server.stop();
  }
  logger.info({ signal }, `Signal ${signal}`);
  logger.error(err);
  deathCleanup();
});

server = stoppable(
  app.listen(expressConfig, () => {
    const { address, port } = server.address();
    logger.info(`🚀 Server started at http://${address}:${port}`);
  }),
  stopGrace
);
