'use strict';
const TOKEN = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
const cmd = require('./cmd.js');

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

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`);

console.log('Hymybot started in the ' + process.env.NODE_ENV + ' mode');

function sendMsg(msg, confirm_text) {
  bot.sendMessage(msg.chat.id, confirm_text)
  .then(function () {
    console.log('sent confirmation');
  }, function(err) {
    console.error('couldn\'t send confirmation of updated text! Err: ' + err);
  });
}

bot.on('message', function(msg) {
  console.log(msg);
  const words = msg.text.split(' ');
  const cmd_only = words[0].replace(/@.+/, '');
  cmd.call(cmd_only, msg, words);
});

cmd.register('/testi', function(msg, words){
  bot.sendMessage(msg.chat.id, "Moi! " + words[1]);
});

module.exports = bot;
