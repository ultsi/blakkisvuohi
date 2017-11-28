'use strict';
const TOKEN = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
const cmd = require('./lib/cmd.js');
const users = require('./users.js');
const promillet = require('./promillet.js');

const botOptions = {
  polling: true // used when no HTTPS:// connection available
};

const bot = new Bot(TOKEN, botOptions);
global.bot = bot;

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
// bot.setWebHook(`${url}/bot${TOKEN}`);

console.log('BläkkisVuohi started in the ' + process.env.NODE_ENV + ' mode');

bot.on('message', function(msg) {
  console.log(msg);
  if(!msg.text){ return; }
  const words = msg.text.split(' ');
  const cmd_only = words[0].replace(/@.+/, '').toLowerCase();
  cmd.call(cmd_only, msg, words);
});

module.exports = bot;
