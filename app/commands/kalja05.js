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
    /kalja05
    Drink one 0.5l 4.7% beer 
*/
'use strict';
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const constants = require('../constants.js');
const strings = require('../strings.js');

function kalja05Command(context, user, msg, words) {
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(constants.KALJA05, '/kalja05', msg)
        .then((permilles) => {
            deferred.resolve(context.privateReply(utils.getRandom(strings.drink_responses) + ' ' + permilles.toFixed(2) + '‰'));
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/kalja05', 
    '/kalja05 - pikanäppäin yhdelle kappaleelle 0.5l olutta. Ammattilaiskäyttöön.', 
    Commands.TYPE_PRIVATE, 
    [kalja05Command]
);
