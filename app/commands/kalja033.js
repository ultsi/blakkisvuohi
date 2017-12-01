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
    /kalja033
    Drink one 0.33l 4.7% beer 
*/
'use strict';

const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const constants = require('../constants.js');
const strings = require('../strings.js');

function kaljaCommand(context, user, msg, words) {
    let deferred = when.defer();
    user.drinkBoozeReturnPermilles(constants.KALJA033, '/kalja033', msg)
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
    '/kalja033',
    '/kalja033 - pikanäppäin yhdelle kappaleelle olutta. Ammattilaiskäyttöön.',
    Commands.TYPE_PRIVATE, [kaljaCommand]
);