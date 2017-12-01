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
    init.js
    Initialize Bläkkisvuohi, set hooks & load enabled commands
*/

'use strict';

module.exports = function(bot) {

    const Commands = require('./lib/commands.js');
    const utils = require('./lib/utils.js');

    // Initialize message hook to Command framework
    bot.on('message', (msg) => {
        console.log(msg);
        if (!msg.text) {
            return;
        }
        const words = msg.text.split(' ');
        const cmd_only = words[0].replace(/@.+/, '').toLowerCase(); // remove trailing @username

        utils.attachMethods(msg, bot);

        Commands.call(cmd_only, msg, words);
    });

    require('./bot_commands.js');

};
