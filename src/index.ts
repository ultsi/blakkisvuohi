/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    index.js
    Main entrypoint, initialize tg-bot and then start to initialize
    the possible web server and finally the app.
*/

'use strict'

const TOKEN: string = process.env.TOKEN

import * as Logger from 'loglevel'
import * as newrelic from 'newrelic'
import * as Bot from 'node-telegram-bot-api'
import Init from './init'
import Webhook from './web'

global.newrelic = process.env.NEWRELIC ? newrelic : null

const log = Logger.getLogger('system')

const BOT_MODE: string = process.env.BOT_MODE || 'polling'
// Setup bot
let bot

if (BOT_MODE === 'polling') {
    const botOptions = {
        polling: true, // used when no HTTPS:// connection available
    }
    bot = new Bot(TOKEN, botOptions)
} else {
    bot = new Bot(TOKEN)

    // This informs the Telegram servers of the new webhook.
    // Note: we do not need to pass in the cert, as it already provided
    // bot.setWebHook(`${url}/bot${TOKEN}`)
    bot.setWebHook(process.env.APP_URL + TOKEN)

    // Load web server
    Webhook(bot, TOKEN)
}

// Load app
Init(bot)

log.info('BläkkisVuohi started in ' + BOT_MODE + ' mode')
