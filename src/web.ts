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
    web.ts
    Web endpoints for HTTPS webhook bot setups (like Heroku)
*/

import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as logger from 'loglevel'

export default function (bot: any, token : string): void {
    const log = logger.getLogger('system')

    // Setup web server for heroku
    const app = express()
    app.use(bodyParser.json())

    const server = app.listen(process.env.PORT, '0.0.0.0', () => {
        const host = server.address().address
        const port = server.address().port
        log.info('Web server started at http://%s:%s', host, port)
    })
    app.post('/' + token, (req, res) => {
        bot.processUpdate(req.body)
        res.sendStatus(200)
    })
}