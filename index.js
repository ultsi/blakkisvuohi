/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
