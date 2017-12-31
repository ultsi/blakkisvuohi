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

/*
    /terms
    List terms of Bläkkisvuohi
*/
'use strict';

const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const Message = require('../lib/message.js');
const strings = require('../strings.js');

function termsCommand(context, user, msg, words) {
    context.end();
    return context.sendMessage(Message.PrivateMessage(strings.terms, {
        'parse_mode': 'Markdown'
    }));
}

Commands.registerUserCommand(
    '/terms',
    '/terms - Terms of Service',
    Commands.TYPE_PRIVATE, [termsCommand]
);

Commands.registerUserCommand(
    '/privacy',
    '/privacy - Privacy Policy',
    Commands.TYPE_PRIVATE, [termsCommand]
);