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
    /komennot
    Print commands
*/
'use strict';

const Commands = require('../lib/commands.js');
const strings = require('../strings.js');

function cmdListCommand(context, msg, words) {
    const cmdListStr = Object.values(Commands.__cmds__)
        .filter(cmd => !cmd.adminCommand)
        .map(cmd => cmd.cmd_help)
        .join('\n');
    const cmdStr = strings.commands.blakkis.cmd_list.format({
        cmd_list: cmdListStr
    });
    return msg.sendPrivateMessage(cmdStr);
}

Commands.registerSimple(
    '/komennot',
    strings.commands.komennot.cmd_description,
    Commands.TYPE_PRIVATE, cmdListCommand
);