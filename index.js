'use strict';
const TOKEN = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
const cmd = require('./cmd.js');
const users = require('./users.js');
const promillet = require('./promillet.js');

const botOptions = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};
const url = process.env.APP_URL || 'https://hymybot.herokuapp.com:443';

const bot = new Bot(TOKEN, botOptions);
global.bot = bot;

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`);

console.log('BläkkisVuohi started in the ' + process.env.NODE_ENV + ' mode');

bot.on('message', function(msg) {
  console.log(msg);
  if(!msg.text){ return; }
  const words = msg.text.split(' ');
  const cmd_only = words[0].replace(/@.+/, '');
  cmd.call(cmd_only, msg, words);
});

module.exports = bot;
