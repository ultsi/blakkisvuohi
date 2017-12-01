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
    /luotunnus
    3 phased command where the user can sign up to use the bot's functionality
    Asks for weight and gender for future calculations
*/
'use strict';

const log = require('loglevel').getLogger('commands');
const when = require('when');

const Commands = require('../lib/commands.js');
const utils = require('../lib/utils.js');
const users = require('../db/users.js');

function signupPhase1(context, msg, words) {
    let username = msg.from.username;
    if (!username) {
        username = msg.from.first_name;
        if (msg.from.last_name) {
            username = username + ' ' + msg.from.last_name;
        }
    }
    context.storeVariable('username', username);
    context.storeVariable('userId', msg.from.id);
    context.nextPhase();
    return context.privateReply('Tervetuloa uuden tunnuksen luontiin ' + username + '. Alkoholilaskuria varten tarvitsen tiedot painosta ja sukupuolesta.\n\nSyötä ensimmäiseksi paino kilogrammoissa ja kokonaislukuna:');
}

function signupPhase2(context, msg, words) {
    if (!utils.isValidInt(words[0])) {
        return context.privateReply('Paino ei ole kokonaisluku');
    }

    let weight = parseInt(words[0], 10);
    if (weight < 30 || weight > 200) {
        return context.privateReply('Painon ala- ja ylärajat ovat 30kg ja 200kg.');
    }

    context.storeVariable('weight', weight);
    context.nextPhase();
    return context.privateReplyWithKeyboard('Paino tallennettu. Syötä seuraavaksi sukupuoli:', [
        ['mies', 'nainen']
    ]);
}

function signupPhase3(context, msg, words) {
    if (words[0] !== 'nainen' && words[0] !== 'mies') {
        return context.privateReplyWithKeyboard('Syötä joko nainen tai mies', [
            ['mies', 'nainen']
        ]);
    }

    const userId = context.fetchVariable('userId');
    const username = context.fetchVariable('username');
    const weight = context.fetchVariable('weight');
    const gender = words[0];
    context.end();

    let deferred = when.defer();
    users.new(userId, username, weight, gender)
        .then((user) => {
            deferred.resolve(context.privateReply('Moikka ' + user.username + '! Tunnuksesi luotiin onnistuneesti. Muista, että antamani luvut alkoholista ovat vain arvioita, eikä niihin voi täysin luottaa. Ja eikun juomaan!'));
        }, (err) => {
            log.error('Error creating new user! ' + err);
            log.debug(err.stack);
            deferred.reject('Isompi ongelma, ota yhteyttä adminiin.');
        });
    return deferred.promise;
}

// Register the command
Commands.register(
    '/luotunnus',
    '/luotunnus - Luo itsellesi tunnus botin käyttöä varten.',
    Commands.TYPE_PRIVATE, [signupPhase1, signupPhase2, signupPhase3]
);