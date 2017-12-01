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
const BOT_MODE = process.env.BOT_MODE || 'polling';
const log = require('loglevel').getLogger('system');

// Setup bot
let bot;

if (BOT_MODE === 'polling') {
    const botOptions = {
        polling: true // used when no HTTPS:// connection available
    };
    bot = new Bot(TOKEN, botOptions);
} else {
    bot = new Bot(TOKEN);
    
    // This informs the Telegram servers of the new webhook.
    // Note: we do not need to pass in the cert, as it already provided
    // bot.setWebHook(`${url}/bot${TOKEN}`);
    bot.setWebHook(process.env.APP_URL + TOKEN);

    // Load web server
    require('./web.js')(bot, TOKEN);
}

// Load app
require('./app/init.js')(bot);

log.info('BläkkisVuohi started in ' + BOT_MODE + ' mode');