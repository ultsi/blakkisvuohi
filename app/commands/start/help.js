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
    help.js
    Inline menu for help
*/

'use strict';

const strings = require('../../strings.js');
const constants = require('../../constants.js');
const str_help = strings.commands.start.help;
const utils = require('../../lib/utils.js');

module.exports = {
    _text: str_help.on_select,
    [str_help.general.button_text]: {
        _text: str_help.general.on_select,
    },
    [str_help.faq.button_text]: {
        _text: str_help.faq.on_select,
        [str_help.faq.juominen.button_text]: {
            _text: str_help.faq.juominen.on_select,
        },
        [str_help.faq.ryhmat.button_text]: {
            _text: str_help.faq.ryhmat.on_select,
        },
        [str_help.faq.koodi.button_text]: {
            _text: str_help.faq.koodi.on_select,
        }
    },
    [str_help.privacy.button_text]: {
        _text: str_help.privacy.on_select,

    },
};