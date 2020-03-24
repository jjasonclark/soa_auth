'use strict';

const death = require('death')({ uncaughtException: true });
const express = require('express');
const expressPinoLogger = require('express-pino-logger');
const helmet = require('helmet');
const pino = require('pino');
const stoppable = require('stoppable');
const jose = require('jose');

const stopGrace = 5000;
const loggerConfig = { level: 'debug' };
const expressConfig = { port: 3000, host: '0.0.0.0' };

const key = {
  // openssl genrsa -out jwt.pem 2048
  public: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwvhyrlZtEMKOiV5JKb3S
Yh6zAKh/lqZ1jOpWF0g1RKAjtIbcrdydiRSuWor5aSPaaCgw813wd4R1qtpeyGA4
WrfX5bQJo+3LhABm5IpoaCkf6LlSsL/9qQ5Dcvt+dEZR8hre9W/M+vZRrAlADrHl
Z+R2I1C6vAcrIKpXppLAVmXXpFpICxcpIrx/aXBi7GIdw1G4VxdHVGkTOlinYa8u
dJRF+ZraEYPL4Q9UWDr3tzWvLtFsGNpnB+/yUnvcCAeVq/u3Vv8aY4rL0EgEY0tu
eOGQKAjqpuhjEHzuT5BU8SPv+UKZWuLdsagqouhEI8CpaM0LHkBsOXFUPKzJ97We
AQIDAQAB
-----END PUBLIC KEY-----`,
  // openssl rsa -in jwt.pem -pubout > jwt.pub
  private: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAwvhyrlZtEMKOiV5JKb3SYh6zAKh/lqZ1jOpWF0g1RKAjtIbc
rdydiRSuWor5aSPaaCgw813wd4R1qtpeyGA4WrfX5bQJo+3LhABm5IpoaCkf6LlS
sL/9qQ5Dcvt+dEZR8hre9W/M+vZRrAlADrHlZ+R2I1C6vAcrIKpXppLAVmXXpFpI
CxcpIrx/aXBi7GIdw1G4VxdHVGkTOlinYa8udJRF+ZraEYPL4Q9UWDr3tzWvLtFs
GNpnB+/yUnvcCAeVq/u3Vv8aY4rL0EgEY0tueOGQKAjqpuhjEHzuT5BU8SPv+UKZ
WuLdsagqouhEI8CpaM0LHkBsOXFUPKzJ97WeAQIDAQABAoIBAFAVSs2vNDdJItDr
yHN7w7mH0JC5pUaU8v3Bl0ES6MZaXLAfIO/NCWwv8XnBUbbNAj38HDcqY8ZDwy09
auc1FpC0qNpx+++4kfqTS7Ad5cq68Z9e18c/5QoWkL/e608JP0mJngEEPhbrLBrU
5dnjWk41Og1BcKIg86cEMOJ7rsMNc6cLOO/sb+Mzl/WIj9JoBgasE9wYRDzxe4By
LBDrTdDmjRHRohYh/B4xMVh6qu4icqwHesVKEEv9nx9U6LbqeUXzjZGDOvFnEPjh
pI3Grg0XtV/QhFz1hZmzRInDXTt7o6di2hknaBP7eZwtdxcyl5Pmu1rR0vG7cjrc
yzBQBk0CgYEA9Ci8eOwffaLB7EpEI6HN4izUMYANTmUGLw5feKYbfF2j05eq4Do+
3e6jbDBTZMBKSCM/KK4E2+71PXqQcEmPcYkXaHUvpYUOjEnHLhevy0iS/QqjX5I0
gk++JU2ERbzhRb2mQtg8t9TDIX++/kQ8t1hv6ARXlGcEdq2ow7sBXLsCgYEAzG0H
fncVa0XSDQ7UZl5GlsNi2JiOlhrlsoBs5T98ngzRLZy2THJz9EAbGF2AvQnoTdlA
ny5+pRGjbCY7+GE2W83J08saNdv3EP5QZgG0FG+i6h3wk/Vs4WDitjTXTEKG0mmT
yKixmvJJdK4Lcm5DggMkV0SUSrKXbsEr2g/mgnMCgYEAutS1K/7bNgMmS06lB3MY
HVtaYCpxhCyP59AixCqvW6I364DiU8SeOKsUSIROPAlcjgjSmqlWtIkNBidUgWf4
qNNToy4Q8KJ5eGY4UQ/1CCQXviO20joJjjHA+cBwWADpjLlLkVjwVWcsjeS33M+Q
emfk8fDop3mRE9NdEbF2oGMCgYEAvZ5skxv2nDh5bG9TCVltdK7r4ykvKYDtizOg
zsyi1R/ib8KrPiHz+J32BBXHMpIcDwnz7TN9ebPwuIKGog/aEjHCglgkicztUa/z
94qg9UvP/AWlgDjos+3gnU5KXoxe7pHL6RbBF46iID7Ik24/5Drx3JjaTKd3294G
xRB2qo0CgYBoa+BfkeUpjTWuhSnKJGPzrXROnhSv6aUWEcod2chGCnKcZKoKEbnE
ZftKxblKLSPUO+y3YHTF4G6wtHmGTh4JczZudkmoaRJd13ShrRpHoYTx6dsOTj36
tIlPFJjVce6uvvn6Ld7VQ55iqkQCbBzqOJulOarQP8pIciAcPZIZRA==
-----END RSA PRIVATE KEY-----`
};

const logger = pino(loggerConfig);
const routes = {
  login: '/login',
  protected: '/api'
};

const encodeAuthToken = what => {
  return jose.JWT.sign(what, key.private, {
    algorithm: 'RS256',
    audience: 'http://localhost:3000',
    expiresIn: '1 minute',
    issuer: 'http://localhost:3000'
  });
};

const decodeAuthToken = auth => {
  try {
    const decoded = jose.JWT.verify(auth, key.public, {
      algorithms: ['RS256'],
      audience: 'http://localhost:3000',
      issuer: 'http://localhost:3000'
    });
    return decoded.user;
  } catch (ex) {
    return null;
  }
};

// Exposed server
const app = express();

// Settings
app.set('trust proxy', 1);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.sendStatus(500);
});

// Middleware
app.use(expressPinoLogger({ logger }));
app.use(helmet());
app.use(express.static('public'));

// Post to get a token
app.post(routes.login, async (req, res) => {
  res.json({ jwt: encodeAuthToken({ user: 'user-1' }) });
});

// Protected route
app.get(routes.protected, async (req, res) => {
  const user = decodeAuthToken(req.get('authorization'));
  if (user) {
    res.json({ user });
  } else {
    res.sendStatus(401);
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
