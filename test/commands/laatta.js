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
    laatta.js
    unit tests for laatta.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/laatta.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');

describe('laatta.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /laatta should ask for confirmation', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/laatta', mocked.msg, ['/laatta']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.notEqual(mocked.internals.sentText.match('varma'));
                assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });

    it('Calling /laatta should ask for confirmation again if answer is not one of the options', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/laatta', mocked.msg, ['/laatta']);

        new Promise((resolve) => {
                setTimeout(() => {
                    try {
                        assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                        assert.notEqual(mocked.internals.sentText.match('varma'));
                        assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                        Commands.call('test', mocked.msg, ['test']);
                        resolve();
                    } catch (err) {
                        done(err);
                    }
                }, 50);
            })
            .then(() => {
                setTimeout(() => {
                    try {
                        assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                        assert.notEqual(mocked.internals.sentText.match('varma'), null);
                        assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }, 50);
            });
    });

    it('Calling /laatta should undo if option yes is selected', function(done) {
        this.slow(200);
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                try {
                    assert.equal(rows.length, 2);
                    Commands.call('/laatta', mocked.msg, ['/laatta']);
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            Commands.call('Kyllä', mocked.msg, ['Kyllä']); // yes option
                            setTimeout(() => {
                                resolve(user.getBooze());
                            }, 50);
                        });
                    });
                } catch (err) {
                    return Promise.reject(err);
                }
            })
            .then((rows) => {
                try {
                    assert.equal(rows.length, 1);
                    done();
                } catch (err) {
                    return Promise.reject(err);
                }
            })
            .catch((err) => done(err));
    });

    it('Calling /laatta should not undo if option no is selected', function(done) {
        this.slow(200);
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                try {
                    assert.equal(rows.length, 2);
                    Commands.call('/laatta', mocked.msg, ['/laatta']);
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            Commands.call('En', mocked.msg, ['En']); // no option
                            setTimeout(() => {
                                resolve(user.getBooze());
                            }, 50);
                        });
                    });
                } catch (err) {
                    return Promise.reject(err);
                }
            })
            .then((rows) => {
                try {
                    assert.equal(rows.length, 2);
                    done();
                } catch (err) {
                    return Promise.reject(err);
                }
            })
            .catch((err) => done(err));
    });
});