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
const query = require('pg-query');
const utils = require('../app/lib/utils.js');
query.connectionParameters = process.env.DATABASE_URL;

exports.up = () => {
    return query('select userid, nick from users')
        .then((res) => {
            try {
                const rows = res[0];
                if (rows.length > 0) {
                    const valuePairs = rows.map((u, key) => '($' + (2 * key + 1) + ', $' + (2 * key + 2) + ')');
                    const params = rows.reduce((arr, u) => {
                        arr.push(u.userid);
                        arr.push(utils.encrypt(u.nick));
                        return arr;
                    }, []);
                    const queryStr = 'UPDATE users set nick = u.value from (VALUES ' + valuePairs.join(', ') + ') as u(id, value) WHERE u.id = users.userid';
                    console.log(params);
                    query(queryStr, params)
                        .then(() => {
                            return Promise.resolve();
                        }).catch((err) => {
                            console.log(err);
                            return Promise.reject(err);
                        });
                } else {
                    return Promise.resolve();
                }
            } catch (err) {
                console.log(err);
                return Promise.reject(err);
            }
        }).catch((err) => {
            console.log(err);
            return Promise.reject(err);
        });
};

exports.down = () => {
    query('select userid, nick from users')
        .then((res) => {
            try {
                const rows = res[0];
                const valuePairs = rows.map((u, key) => '($' + (2 * key + 1) + ', $' + (2 * key + 2) + ')');
                const params = rows.reduce((arr, u) => {
                    arr.push(u.userid);
                    arr.push(utils.decrypt(u.nick));
                    return arr;
                }, []);
                const queryStr = 'UPDATE users set nick = u.value from (VALUES ' + valuePairs.join(', ') + ') as u(id, value) WHERE u.id = users.userid';
                query(queryStr, params)
                    .then(() => {
                        return Promise.resolve();
                    }).catch((err) => {
                        return Promise.reject(err);
                    });
            } catch (err) {
                console.log(err);
                return Promise.reject(err);
            }
        }).catch((err) => {
            return Promise.reject(err);
        });
};