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
    const log = require('loglevel');
    const settings = require('./settings.js');
    const syslog = log.getLogger('system');

    // Initialize logging levels
    log.getLogger('system').setLevel(settings.log_system_level);
    log.getLogger('db').setLevel(settings.log_db_level);
    log.getLogger('commands').setLevel(settings.log_commands_level);

    syslog.info('Set system log level to ' + settings.log_system_level);
    syslog.info('Set db log level to ' + settings.log_db_level);
    syslog.info('Set commands log level to ' + settings.log_commands_level);

    // Initialize message hook to Command framework
    bot.on('message', (msg) => {
        syslog.debug(msg);
        if (!msg.text) {
            return;
        }
        const words = msg.text.split(' ');
        const cmd_only = words[0].replace(/@.+/, '').toLowerCase(); // remove trailing @username

        utils.attachMethods(msg, bot);

        Commands.call(cmd_only, msg, words);
    });

    // Enable commands here.
    require('./commands/annokset.js');
    require('./commands/juoma.js');
    require('./commands/kalja033.js');
    require('./commands/kalja05.js');
    require('./commands/kulutus.js');
    require('./commands/kuvaaja.js');
    require('./commands/laatta.js');
    require('./commands/luotunnus.js');
    require('./commands/moro.js');
    require('./commands/otinko.js');
    require('./commands/promillet.js');
    require('./commands/whoami.js');

    // Admin commands
    require('./commands/admin_loglevel.js');

};