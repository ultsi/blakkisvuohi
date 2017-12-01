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
const Commands = require('./app/lib/commands.js');
const express = require('express');
const packageInfo = require('./package.json');
const bodyParser = require('body-parser');

// Load commands
require('./app/loader.js');

// Setup bot
const bot = new Bot(TOKEN);
global.bot = bot;

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
// bot.setWebHook(`${url}/bot${TOKEN}`);
bot.setWebHook(process.env.APP_URL + TOKEN);

bot.on('message', (msg) => {
    console.log(msg);
    if (!msg.text) {
        return;
    }
    const words = msg.text.split(' ');
    const cmd_only = words[0].replace(/@.+/, '').toLowerCase();
    Commands.call(cmd_only, msg, words);
});

// Setup web server for heroku

var app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        version: packageInfo.version
    });
});

var server = app.listen(process.env.PORT, '0.0.0.0', () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
});

app.post('/' + TOKEN, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

console.log('BläkkisVuohi started in the ' + process.env.NODE_ENV + ' mode');

module.exports = bot;