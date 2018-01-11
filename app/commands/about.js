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
    /about
    Print short description about Bläkkisvuohi
*/
'use strict';

const Commands = require('../lib/commands.js');
const Message = require('../lib/message.js');
const strings = require('../strings.js');

const aboutCommand = {
    [0]: {
        startMessage: Message.PrivateMessage(strings.about, {
            'parse_mode': 'Markdown'
        }),
        validateInput: () => {return true;},
        onValidInput: (context) => {return context.end();}
    }
};

Commands.register(
    '/about',
    '/about - About the bot',
    Commands.TYPE_PRIVATE, aboutCommand
);