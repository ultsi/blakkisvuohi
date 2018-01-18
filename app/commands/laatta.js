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
const message = require('../lib/message.js');
const strings = require('../strings.js');

let command = {
    [0]: {
        startMessage: message.PrivateKeyboardMessage(strings.commands.laatta.start_text, [
            [strings.commands.laatta.start_answer_yes, strings.commands.laatta.start_answer_no]
        ]),
        validateInput: (context, user, msg, words) => {
            let answer = words[0].toLowerCase();
            return answer === strings.commands.laatta.start_answer_yes.toLowerCase() || answer === strings.commands.laatta.start_answer_no.toLowerCase();
        },
        onValidInput: (context, user, msg, words) => {
            let deferred = when.defer();
            if (words[0].toLowerCase() === strings.commands.laatta.start_answer_yes.toLowerCase()) {
                user.undoDrink()
                    .then(() => {
                        user.getBooze()
                            .then((drinks) => {
                                let ebac = alcomath.calculateEBACFromDrinks(user, drinks);
                                let permilles = ebac.permilles;
                                let permilles30Min = ebac.permilles30Min;
                                deferred.resolve(context.privateReply(strings.commands.laatta.success.format({
                                    permilles: permilles,
                                    permilles30Min: permilles30Min
                                })));
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
                deferred.resolve(context.privateReply(strings.commands.laatta.cancel));
            }
            return deferred.promise;
        },
        errorMessage: message.PrivateKeyboardMessage(strings.commands.laatta.error_text, [[strings.commands.laatta.start_answer_yes, strings.commands.laatta.start_answer_no]])
    }
};

Commands.registerUserCommandV2(
    '/laatta',
    strings.commands.laatta.cmd_description,
    Commands.TYPE_PRIVATE, command
);