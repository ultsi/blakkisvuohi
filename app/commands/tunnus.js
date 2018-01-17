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
        startMessage: message.PrivateMessage('Tervetuloa tunnuksen luomiseen tai päivittämiseen. Alkoholilaskuria varten tarvitsen seuraavat tiedot: paino, pituus ja sukupuoli.\n\nSyötä ensimmäiseksi paino kilogrammoissa ja kokonaislukuna:'),
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
        errorMessage: message.PrivateMessage('Syötä paino uudelleen. Painon pitää olla kokonaisluku ja ala- ja ylärajat ovat 20kg ja 250kg.')
    },
    height: {
        startMessage: message.PrivateMessage('Paino tallennettu. Syötä seuraavaksi pituus senttimetreissä:'),
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
        errorMessage: message.PrivateMessage('Syötä pituus uudelleen. Pituuden täytyy olla kokonaisluku ja ala- ja ylärajat ovat 120cm ja 240cm.')
    },
    gender: {
        startMessage: message.PrivateKeyboardMessage('Pituus tallennettu. Syötä seuraavaksi sukupuoli:', [
            ['Mies', 'Nainen']
        ]),
        validateInput: (context, msg, words) => {
            let gender = words[0].toLowerCase();
            return gender === 'mies' ||  gender === 'nainen';
        },
        onValidInput: (context, msg, words) => {
            let deferred = when.defer();
            const gender = words[0].toLowerCase();
            context.storeVariable('gender', gender);
            deferred.resolve();

            return deferred.promise;
        },
        nextPhase: 'terms',
        errorMessage: message.PrivateKeyboardMessage('Syötä joko mies tai nainen:', [
            ['Mies', 'Nainen']
        ])
    },
    terms: {
        startMessage: message.PrivateKeyboardMessage('Sukupuoli tallennettu. \n\n' + strings.terms + '\n\nOletko lukenut ja hyväksynyt käyttöehdot?', [
            ['Kyllä', 'En']
        ]),
        validateInput: (context, msg, words) => {
            let read = words[0].toLowerCase();
            return read === 'kyllä' || read === 'en';
        },
        onValidInput: (context, msg, words) => {
            let deferred = when.defer();
            let read = words[0].toLowerCase();
            if (read === 'en') {
                deferred.resolve(context.privateReply('Lue käyttöehdot ja hyväksy ne, ennen kuin voit käyttää muita komentoja.'));
                context.end();
                return deferred.promise;
            }

            try {
                const userId = context.fetchVariable('userId');
                const username = context.fetchVariable('username');
                const weight = context.fetchVariable('weight');
                const height = context.fetchVariable('height');
                const gender = context.fetchVariable('gender');
                users.find(userId)
                    .then((user) => {
                        user.updateInfo(username, weight, gender, height, true)
                            .then(() => {
                                deferred.resolve(context.privateReply('Olet jo rekisteröitynyt. Tiedot päivitetty.'));
                            }, (err) => {
                                log.error('Error creating new user! ' + err);
                                log.debug(err.stack);
                                deferred.resolve(context.privateReply('Olet jo rekisteröitynyt, mutta tietojen päivityksessä tuli ongelma. Ota yhteyttä adminiin.'));
                            });
                    }, () => {
                        // try to create a new user
                        users.new(userId, username, weight, gender, height, true)
                            .then((user) => {
                                deferred.resolve(context.privateReply('Moikka ' + user.username + '! Tunnuksesi luotiin onnistuneesti. Muista, että kaikki antamani luvut ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'));
                            }, (err) => {
                                log.error('Error creating new user! ' + err);
                                log.debug(err.stack);
                                deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
                            });
                    });
            } catch (err) {
                log.error(err);
                log.debug(err.stack);
                deferred.reject(err);
            }

            return deferred.promise;
        },
        errorMessage: message.PrivateKeyboardMessage('Oletko lukenut ja hyväksynyt käyttöehdot?', [
            ['Kyllä', 'En']
        ])
    }
};

// Register the command
Commands.register(
    '/tunnus',
    '/tunnus - Luo itsellesi uusi tunnus tai muokkaa tunnustasi.',
    Commands.TYPE_PRIVATE, command
);