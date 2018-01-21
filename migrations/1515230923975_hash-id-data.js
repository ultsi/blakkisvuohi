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

'use strict';

exports.up = (pgm) => {
    pgm.alterColumn('users', 'userid', {
        type: 'text'
    });
    pgm.alterColumn('users_drinks', 'userid', {
        type: 'text'
    });
    pgm.alterColumn('users_in_groups', 'userid', {
        type: 'text'
    });
    pgm.alterColumn('users_in_groups', 'groupid', {
        type: 'text'
    });
};

exports.down = (pgm) => {
    pgm.alterColumn('users', 'userid', {
        type: 'int'
    });
    pgm.alterColumn('users_drinks', 'userid', {
        type: 'int'
    });
    pgm.alterColumn('users_in_groups', 'userid', {
        type: 'int'
    });
    pgm.alterColumn('users_in_groups', 'groupid', {
        type: 'bigint'
    });
};