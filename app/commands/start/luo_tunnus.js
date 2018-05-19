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
    luo_tunnus.js
    Inline menu for creating a new account
*/

'use strict';

const strings = require('../../strings.js');
const str_luo_tunnus = strings.commands.start.luo_tunnus;
const terms = strings.commands.terms.reply;
const utils = require('../../lib/utils.js');
const users = require('../../db/users.js');
module.exports = {
    _nonUserRequired: true,
    _text: str_luo_tunnus.on_select,
    _onText: (context, user, msg, words) => {
        const username = users.getUsernameFromMsg(msg);
        const userId = msg.from.id;
        let weight = context.fetchVariable('weight');
        let height = context.fetchVariable('height');
        let gender = context.fetchVariable('gender');

        context.storeVariable('userId', msg.from.id);

        if (!weight) {
            weight = parseInt(words[0], 10);
            if (!utils.isValidInt(weight) || weight < 20 || weight > 250) {
                return Promise.resolve(str_luo_tunnus.weight_error);
            }
            context.storeVariable('weight', weight);
            return Promise.resolve(str_luo_tunnus.height);
        }

        if (!height) {
            height = parseInt(words[0], 10);
            if (!utils.isValidInt(height) || height < 120 || height > 240) {
                return Promise.resolve(str_luo_tunnus.height_error);
            }
            context.storeVariable('height', height);
            return Promise.resolve({
                text: str_luo_tunnus.gender,
                keyboard: [
                    [strings.gender.male, strings.gender.female]
                ]
            });
        }

        if (!gender) {
            gender = words[0];
            context.storeVariable('gender', gender);
            return Promise.resolve({
                text: str_luo_tunnus.terms.format({
                    terms: terms
                }),
                keyboard: [
                    [strings.yes, strings.no]
                ]
            });
        }

        const terms_answer = words[0];
        if (terms_answer.toLowerCase() !== strings.yes.toLowerCase()) {
            return Promise.resolve(str_luo_tunnus.terms_on_reject);
        }

        return users.new(userId, username, weight, gender, height, true)
            .then((user) => {
                return str_luo_tunnus.new_user.format({
                    username: user.username
                });
            });
    },
    _onExit: (context, user) => {
        context.forgetVariable('weight');
        context.forgetVariable('height');
        context.forgetVariable('gender');
        context.forgetVariable('userId');
    }
};