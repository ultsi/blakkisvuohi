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
    unit tests for tunnus.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/tunnus.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const users = require('../../app/db/users.js');
const strings = require('../../app/strings.js');

describe('tunnus.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    it('Calling /tunnus with correct parameters should create a new user', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const userId = 1337;
        mocked.msg.from.id = userId;
        mocked.msg.from.username = 'testuser';

        users.find(userId)
            .then((user) => {
                if (user) {
                    return Promise.reject(new Error('user found when should not exist'));
                }
                return Commands.call('/tunnus', mocked.msg, ['/tunnus']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.start);
                return Commands.call('80', mocked.msg, ['80']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.height);
                return Commands.call('190', mocked.msg, ['190']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.gender);
                return Commands.call(strings.gender.male, mocked.msg, [strings.gender.male]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.terms.format({
                    terms: strings.commands.terms.reply
                }));
                return Commands.call(strings.commands.tunnus.terms_answer_yes, mocked.msg, [strings.commands.tunnus.terms_answer_yes]);
            })
            .then(() => users.find(userId))
            .then((user) => {
                if (user) {
                    return done();
                }
                return Promise.reject(new Error('user creation failed'));
            })
            .catch((err) => done(err));
    });

    it('Calling /tunnus with an existing user should update user values', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        users.find(mocked.msg.from.id)
            .then((foundUser) => {
                if (!foundUser) {
                    return Promise.reject(new Error('user not found when should exist'));
                }
                return Commands.call('/tunnus', mocked.msg, ['/tunnus']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.start);
                return Commands.call('80', mocked.msg, ['80']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.height);
                return Commands.call('190', mocked.msg, ['190']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.gender);
                return Commands.call(strings.gender.male, mocked.msg, [strings.gender.male]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.tunnus.terms.format({
                    terms: strings.commands.terms.reply
                }));
                return Commands.call(strings.commands.tunnus.terms_answer_yes, mocked.msg, [strings.commands.tunnus.terms_answer_yes]);
            })
            .then(() => users.find(mocked.msg.from.id))
            .then((foundUser) => {
                if (foundUser) {
                    assert.equal(mocked.internals.sentText, strings.commands.tunnus.update);
                    return done();
                }
                return Promise.reject(new Error('user creation failed'));
            })
            .catch((err) => done(err));
    });
});