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
    /otinko
    Lists last 48h events
*/
'use strict';
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');

function makeDrinksString(drinks) {
    let list = [];
    let day = null;
    for (var i in drinks) {
        let drink = drinks[i];
        let drinkTime = new Date(Date.parse(drink.created));
        let drinkShortDate = drinkTime.getDate() + '.' + (drinkTime.getMonth() + 1) + '.';
        if (day !== drinkShortDate)  {
            day = drinkShortDate;
            list.push(day);
        }
        let drinkHours = drinkTime.getHours() + '';
        if (drinkHours.length === 1) {
            drinkHours = '0' + drinkHours;
        }
        let drinkMinutes = drinkTime.getMinutes() + '';
        if (drinkMinutes.length === 1) {
            drinkMinutes = '0' + drinkMinutes;
        }
        list.push(drinkHours + ':' + drinkMinutes + ' ' + drink.description);
    }
    return list.join('\n');
}

function otinko(context, user, msg, words) {
    let deferred = when.defer();
    user.getBoozeForLastHours(48)
        .then((drinks) => {
            try {
                let drinkList = makeDrinksString(drinks);
                deferred.resolve(context.privateReply('Viimeisen kahden päivän häppeningit:\n' + drinkList));
            } catch (err) {
                log.error(err);
                log.debug(err.stack);
                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
            }
        }, (err) => {
            log.error(err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/otinko', 
    '/otinko - näyttää otitko ja kuinka monta viime yönä.', 
    Commands.TYPE_PRIVATE, 
    [otinko]
);

