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
    tunnus.js
    Tunnus beta command, uses inline-commands.js
*/

'use strict';

const strings = require('../../strings.js');
const str_tunnus = strings.commands.beta.tunnus;
const terms = strings.commands.terms.reply;
const utils = require('../../lib/utils.js');
const users = require('../../db/users.js');

module.exports = {
    _onSelect: (context, user, msg, words) => {
        if (user) {
            return Promise.resolve(str_tunnus.on_select.format({
                username: user.username,
                user_id: user.userId,
                weight: user.weight,
                height: user.height,
                gender: user.gender,
                created: user.created.toString()
            }));
        } else {
            return Promise.resolve(str_tunnus.on_select_new_user);
        }
    },
    [str_tunnus.luo.button_text]: {
        _nonUserRequired: true,
        _text: str_tunnus.luo.on_select,
        _onText: (context, user, msg, words) => {
            const username = msg.from.username || msg.from.first_name;
            const userId = msg.from.id;
            let weight = context.fetchVariable('weight');
            let height = context.fetchVariable('height');
            let gender = context.fetchVariable('gender');

            context.storeVariable('userId', msg.from.id);

            if (!weight) {
                weight = parseInt(words[0], 10);
                if (!utils.isValidInt(weight) || weight < 20 || weight > 250) {
                    return Promise.resolve(str_tunnus.luo.weight_error);
                }
                context.storeVariable('weight', weight);
                return Promise.resolve(str_tunnus.luo.height);
            }

            if (!height) {
                height = parseInt(words[0], 10);
                if (!utils.isValidInt(height) || height < 120 || height > 240) {
                    return Promise.resolve(str_tunnus.luo.height_error);
                }
                context.storeVariable('height', height);
                return Promise.resolve({
                    text: str_tunnus.luo.gender,
                    keyboard: [
                        [strings.gender.male, strings.gender.female]
                    ]
                });
            }

            if (!gender) {
                gender = words[0];
                context.storeVariable('gender', gender);
                return Promise.resolve({
                    text: str_tunnus.luo.terms.format({
                        terms: terms
                    }),
                    keyboard: [
                        [strings.yes, strings.no]
                    ]
                });
            }

            const terms_answer = words[0];
            if (terms_answer.toLowerCase() !== strings.yes.toLowerCase()) {
                return Promise.resolve(str_tunnus.luo.terms_on_reject);
            }

            return users.new(userId, username, weight, gender, height, true)
                .then((user) => {
                    return str_tunnus.luo.new_user.format({
                        username: user.username
                    });
                });
        },
    },
    [str_tunnus.muokkaa.button_text]: {
        _userRequired: true,
        _text: str_tunnus.muokkaa.on_select,
        [str_tunnus.muokkaa.paino.button_text]: {
            _userRequired: true,
            _onSelect: (context, user, msg, words) => {
                return Promise.resolve(str_tunnus.muokkaa.paino.on_select.format({
                    weight: user.weight
                }));
            },
            _onText: (context, user, msg, words) => {
                const weight = parseInt(words[0], 10);
                if (!utils.isValidInt(weight) || weight < 20 || weight > 250) {
                    return Promise.resolve(str_tunnus.luo.weight_error);
                }
                // TODO: update weight here
                return Promise.resolve(str_tunnus.muokkaa.paino.on_change);
            }
        },
        [str_tunnus.muokkaa.pituus.button_text]: {
            _userRequired: true,
            _onSelect: (context, user, msg, words) => {
                return Promise.resolve(str_tunnus.muokkaa.pituus.on_select.format({
                    height: user.height
                }));
            },
            _onText: (context, user, msg, words) => {
                const weight = parseInt(words[0], 10);
                if (!utils.isValidInt(weight) || weight < 40 || weight > 240) {
                    return Promise.resolve(str_tunnus.luo.height_error);
                }
                // TODO: update height here
                return Promise.resolve(str_tunnus.muokkaa.pituus.on_change);
            }
        },
        [str_tunnus.muokkaa.sukupuoli.button_text]: {
            _userRequired: true,
            _onSelect: (context, user, msg, words) => {
                return Promise.resolve(str_tunnus.muokkaa.sukupuoli.on_select.format({
                    gender: user.gender
                }));
            },
            [strings.gender.male]: {
                _userRequired: true,
                _onSelect: (context, user, msg, words) => {
                    context.setInlineState(context.state.parent); // go back one level
                    // TODO: update gender here
                    return Promise.resolve(str_tunnus.muokkaa.sukupuoli.on_change);
                }
            },
            [strings.gender.female]: {
                _userRequired: true,
                _onSelect: (context, user, msg, words) => {
                    context.setInlineState(context.state.parent); // go back one level
                    // TODO: update gender here
                    return Promise.resolve(str_tunnus.muokkaa.sukupuoli.on_change);
                }
            }
        }
    },
    [str_tunnus.poista.button_text]: {
        _userRequired: true,
        _text: str_tunnus.poista.on_select,
        [strings.yes]: {
            _userRequired: true,
            _text: str_tunnus.poista.double_confirm,
            [strings.no_1st]: {
                _userRequired: true,
                _onSelect: (context, user, msg, words) => {
                    context.setInlineState(context.state.parent.parent); // go back two levels
                    return Promise.resolve(str_tunnus.poista.canceled);
                }
            },
            [strings.yes]: {
                _userRequired: true,
                _text: str_tunnus.poista.deleted
            }
        },
        [strings.no_1st]: {
            _userRequired: true,
            _onSelect: (context, user, msg, words) => {
                return Promise.resolve(str_tunnus.poista.canceled);
            }
        }
    }
};