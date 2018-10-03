const express = require('express');
const fs = require('fs');
const https = require('https');
const open = require("open");
const escapeHTML = require('escape-html');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config({ path: './.env' });

const {
  isPasswordValid,
  isUsernameValid,
  hashPassword,
  verifyPassword
} = require('./app/utils');

const middlewares = require('./app/middlewares');
const storage = require('./app/storage');

const options = {
  hostname: (process.env.APP_HOSTNAME || 'localhost'),
  port: (process.env.APP_PORT || '8080'),
  key: fs.readFileSync((process.env.APP_KEY || '')),
  cert: fs.readFileSync((process.env.APP_CERT || ''))
};

const app = express();
middlewares.use(app);

const homePage = require('./pages/homePage.js');
const server = https.createServer(options, app);

server.listen(options.port, () => {
  const uri = `https://${options.hostname}:${options.port}`;
  open(uri);
  console.log(uri);
});

app.get('/', async (req, res) => {
  const currentUser = req.session.currentUser || [];
  const messages = await storage.messages.getAll();

  res.end(homePage({
    messages,
    username: currentUser.username,
    csrfToken: req.csrfToken()
  }));
});

app.post('/messages', (req, res) => {
  const escapeMsg = escapeHTML(req.body.message || '');

  if (escapeMsg.length < 255 && escapeMsg.length > 1) {
    const username = req.session.currentUser.username;
    storage.messages.create(username, escapeMsg);
    res.redirect('/');
  } else {
    res.send('invalid message');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.post('/signup', async (req, res) => {
  let bSuccess = false;
  const username = escapeHTML(req.body.username || null);
  let password = escapeHTML(req.body.password || null);

  if ((isUsernameValid(username) && isPasswordValid(password))) {
    const user = await storage.users.findByUsername(username);

    if (user === 'USER_NOT_FOUND' || user === 'USER_PARSE_ERROR') {
      bSuccess = true;
      password = hashPassword(password);
      const createdUser = storage.users.create(username, password);
      console.log({createdUser});
    }
  }

  return bSuccess ? res.redirect('/') : res.send('invalid credentials');
});

app.post('/login', async (req, res) => {
  let bSuccess = false;
  const username = escapeHTML(req.body.username || null);
  const password = escapeHTML(req.body.password || null);

  if ((isUsernameValid(username) && isPasswordValid(password))) {
    const user = await storage.users.findByUsername(username);

    if (user !== 'USER_NOT_FOUND' && user !== 'USER_PARSE_ERROR') {
      bSuccess = true;
      delete user.password;
      req.session.currentUser = user;
    }
  }

  return bSuccess ? res.redirect('/') : res.send('invalid credentials');
});
