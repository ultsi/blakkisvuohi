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
    /help
    Print help text
*/
'use strict';

const Commands = require('../lib/commands.js');
const strings = require('../strings.js');

function helpCommand(context, msg, words) {
    const cmdListStr = Object.values(Commands.__cmds__)
        .filter(cmd => cmd.privilege !== Commands.PRIVILEGE_ADMIN)
        .map(cmd => cmd.help)
        .join('\n');
    const cmdStr = strings.commands.blakkis.cmd_list.format({
        cmd_list: cmdListStr
    });
    return msg.sendPrivateMessage(strings.commands.blakkis.help_text + '\n\n' + cmdStr);
}

Commands.register(
    '/help',
    strings.commands.help.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_ALL,
    Commands.TYPE_SINGLE,
    helpCommand
);