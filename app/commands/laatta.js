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
const Commands = require('../lib/commands.js');
const alcomath = require('../lib/alcomath.js');
const message = require('../lib/message.js');
const strings = require('../strings.js');
const utils = require('../lib/utils.js');

let command = {
    start: {
        startMessage: message.PrivateKeyboardMessage(strings.commands.laatta.start_text, [
            [strings.commands.laatta.start_answer_yes, strings.commands.laatta.start_answer_no]
        ]),
        validateInput: (context, msg, words, user) => {
            let answer = words[0].toLowerCase();
            return answer === strings.commands.laatta.start_answer_yes.toLowerCase() || answer === strings.commands.laatta.start_answer_no.toLowerCase();
        },
        onValidInput: (context, msg, words, user) => {
            if (words[0].toLowerCase() === strings.commands.laatta.start_answer_yes.toLowerCase()) {
                return user.undoDrink()
                    .then(() => user.getBooze())
                    .then((drinks) => {
                        let ebac = alcomath.calculateEBACFromDrinks(user, drinks);
                        let permilles = ebac.permilles;
                        let permilles30Min = ebac.permilles30Min;
                        return context.privateReply(strings.commands.laatta.success.format({
                            permilles: utils.roundTo(permilles, 2),
                            permilles30Min: utils.roundTo(permilles30Min, 2)
                        }));
                    });
            } else {
                return context.privateReply(strings.commands.laatta.cancel);
            }
        },
        errorMessage: message.PrivateKeyboardMessage(strings.commands.laatta.error_text, [
            [strings.commands.laatta.start_answer_yes, strings.commands.laatta.start_answer_no]
        ])
    }
};

Commands.register(
    '/laatta',
    strings.commands.laatta.cmd_description,
    Commands.SCOPE_PRIVATE,
    Commands.PRIVILEGE_USER,
    Commands.TYPE_MULTI,
    command
);