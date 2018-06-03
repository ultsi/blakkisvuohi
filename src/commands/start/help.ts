/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    help.js
    Inline menu for help
*/

'use strict'

import * as strings from '../../strings'
const str_help = strings.commands.start.help

module.exports = {
    _text: str_help.on_select,
    _headerTitle: str_help.header_title,
    _formHeader: () => {
        return Promise.resolve(str_help.header)
    },
    [str_help.general.button_text]: {
        _text: str_help.general.on_select,
        _headerTitle: str_help.general.header_title,
    },
    [str_help.faq.button_text]: {
        _text: str_help.faq.on_select,
        _headerTitle: str_help.faq.header_title,
        [str_help.faq.juominen.button_text]: {
            _text: str_help.faq.juominen.on_select,
            _headerTitle: str_help.faq.juominen.header_title,
        },
        [str_help.faq.ryhmat.button_text]: {
            _text: str_help.faq.ryhmat.on_select,
            _headerTitle: str_help.faq.ryhmat.header_title,
        },
        [str_help.faq.koodi.button_text]: {
            _text: str_help.faq.koodi.on_select,
            _headerTitle: str_help.faq.koodi.header_title,
        },
    },
    [str_help.privacy.button_text]: {
        _text: str_help.privacy.on_select,
        _headerTitle: str_help.privacy.header_title,
    },
}