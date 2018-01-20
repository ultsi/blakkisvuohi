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
    /tunnus
    3 phased command where the user can sign up to use the bot's functionality
    Asks for weight, height and gender for future calculations
*/
'use strict';

const log = require('loglevel').getLogger('commands');
const when = require('when');

const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const users = require('../db/users.js');
const message = require('../lib/message.js');
const strings = require('../strings.js');

let command = {
    [0]: {
        startMessage: message.PrivateMessage(strings.commands.tunnus.start),
        validateInput: (context, msg, words) => {
            let weight = parseInt(words[0], 10);
            return utils.isValidInt(words[0]) && weight >= 20 && weight <= 250;
        },
        onValidInput: (context, msg, words) => {
            let deferred = when.defer();
            let username = msg.from.username;
            if (!username) {
                username = msg.from.first_name;
                if (msg.from.last_name) {
                    username = username + ' ' + msg.from.last_name;
                }
            }
            context.storeVariable('username', username);
            context.storeVariable('userId', msg.from.id);

            let weight = parseInt(words[0], 10);
            context.storeVariable('weight', weight);
            deferred.resolve();

            return deferred.promise;
        },
        nextPhase: 'height',
        errorMessage: message.PrivateMessage(strings.commands.tunnus.start_error)
    },
    height: {
        startMessage: message.PrivateMessage(strings.commands.tunnus.height),
        validateInput: (context, msg, words) => {
            let height = parseInt(words[0], 10);
            return utils.isValidInt(words[0]) && height >= 120 && height <= 240;
        },
        onValidInput: (context, msg, words) => {
            let deferred = when.defer();
            let height = parseInt(words[0], 10);
            context.storeVariable('height', height);
            deferred.resolve();

            return deferred.promise;
        },
        nextPhase: 'gender',
        errorMessage: message.PrivateMessage(strings.commands.tunnus.height_error)
    },
    gender: {
        startMessage: message.PrivateKeyboardMessage(strings.commands.tunnus.gender, [
            [strings.gender.male, strings.gender.female]
        ]),
        validateInput: (context, msg, words) => {
            let gender = words[0].toLowerCase();
            return gender === strings.gender.male.toLowerCase() || gender === strings.gender.female.toLowerCase();
        },
        onValidInput: (context, msg, words) => {
            let deferred = when.defer();
            const gender = words[0].toLowerCase();
            context.storeVariable('gender', gender);
            deferred.resolve();

            return deferred.promise;
        },
        nextPhase: 'terms',
        errorMessage: message.PrivateKeyboardMessage(strings.commands.tunnus.gender_error, [
            [strings.gender.male, strings.gender.female]
        ])
    },
    terms: {
        startMessage: message.PrivateKeyboardMessage(strings.commands.tunnus.terms.format({
            terms: strings.commands.terms.reply
        }), [
            [strings.commands.tunnus.terms_answer_yes, strings.commands.tunnus.terms_answer_no]
        ]),
        validateInput: (context, msg, words) => {
            let read = words[0].toLowerCase();
            return read === strings.commands.tunnus.terms_answer_yes.toLowerCase() || read === strings.commands.tunnus.terms_answer_no.toLowerCase();
        },
        onValidInput: (context, msg, words) => {
            let read = words[0].toLowerCase();
            if (read === strings.commands.tunnus.terms_answer_no.toLowerCase()) {
                context.end();
                return Promise.resolve(context.privateReply(strings.commands.tunnus.terms_on_reject));
            }

            const userId = context.fetchVariable('userId');
            const username = context.fetchVariable('username');
            const weight = context.fetchVariable('weight');
            const height = context.fetchVariable('height');
            const gender = context.fetchVariable('gender');
            return users.find(userId)
                .then((user) => {
                    if (user) {
                        return user.updateInfo(username, weight, gender, height, true)
                            .then(() => {
                                return Promise.resolve(context.privateReply(strings.commands.tunnus.update));
                            });
                    } else {
                        return users.new(userId, username, weight, gender, height, true)
                            .then((user) => {
                                return Promise.resolve(context.privateReply(strings.commands.tunnus.new_user.format({
                                    username: user.username
                                })));
                            });
                    }
                }).catch((err) => {
                    log.error('Error creating new user! ' + err);
                    log.error(err.stack);
                    return Promise.reject('Isompi ongelma, ota yhteyttä adminiin.');
                });
        },
        errorMessage: message.PrivateKeyboardMessage(strings.commands.tunnus.terms_error, [
            [strings.commands.tunnus.terms_answer_yes, strings.commands.tunnus.terms_answer_no]
        ])
    }
};

// Register the command
Commands.register(
    '/tunnus',
    strings.commands.tunnus.cmd_description,
    Commands.TYPE_PRIVATE, command
);