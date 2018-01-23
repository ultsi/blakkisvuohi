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
    /loglevel
    Allows the admin to set the loglevel
*/
'use strict';
const log = require('loglevel');
const Commands = require('../lib/commands.js');
const strings = require('../strings.js');

function loglevel(context, msg, words, user) {

    let what = words[1] || 'commands';
    let level = words[2] || 'info';
    if (level !== 'error' && level !== 'debug') {
        level = 'info';
    }

    if (what !== 'system' && what !== 'db' && what !== 'commands') {
        what = 'commands';
    }

    log.getLogger(what).setLevel(level);
    context.end();


    return context.privateReply(strings.commands.admin_loglevel.level_set_text.format({
        logger: what,
        level: level
    }));

}

Commands.register(
    '/admin_loglevel',
    strings.commands.admin_loglevel.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_ADMIN,
    Commands.TYPE_SINGLE,
    loglevel
);