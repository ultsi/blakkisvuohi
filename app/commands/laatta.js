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
    /laatta
    Undoes a drink after confirmation
*/
'use strict';
const when = require('when');
const log = require('loglevel').getLogger('commands');
const Commands = require('../lib/commands.js');
const alcomath = require('../lib/alcomath.js');

function undoDrinkConfirmation(context, user, msg, words) {
    context.nextPhase();
    return context.privateReplyWithKeyboard('Olet laattaamassa viimeksi juodun juomasi. Oletko varma?', [
        ['Kyllä', 'En']
    ]);
}

function undoDrink(context, user, msg, words) {
    let deferred = when.defer();
    if (words[0].toLowerCase() === 'kyllä') {
        user.undoDrink()
            .then(() => {
                user.getBooze()
                    .then((drinks) => {
                        let permilles = alcomath.getPermillesFromDrinks(user, drinks);
                        deferred.resolve(context.privateReply('Laatta onnistui. Olet enää ' + permilles.toFixed(2) + '‰ humalassa.'));
                    }, (err) => {
                        log.error(err);
                        log.debug(err.stack);
                        deferred.reject(err);
                    });
            }, (err) => {
                log.error(err);
                log.debug(err.stack);
                deferred.reject(err);
            });
    } else {
        deferred.resolve(context.privateReply('Laatta peruttu.'));
    }
    context.end();
    return deferred.promise;
}

Commands.registerUserCommand(
    '/laatta', 
    '/laatta - kumoaa edellisen lisätyn juoman', 
    Commands.TYPE_PRIVATE, 
    [undoDrinkConfirmation, undoDrink]
);