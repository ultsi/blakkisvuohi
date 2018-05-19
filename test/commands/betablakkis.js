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
    start.js
    unit tests for start.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/start.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

describe('start.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /start should print normal text', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, 'Tämä on Bläkkisvuohi v3.0 betakomento');
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0);
                mocked.msg.data = 'Juo';
                done();
            })
            .catch((err) => done(err));
    });

    it('Selecting Juo should print Juo text', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, 'Tämä on Bläkkisvuohi v3.0 betakomento');
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0);
                mocked.msg.data = 'Juo';
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Viimeisen kolmen tunnin'), -1);
                done();
            })
            .catch((err) => done(err));
    });

    it('Selecting Juo and then Kalja should drink the beer', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2);
                assert(!rows.find(x => x.description === 'Kalja033'));
                return Commands.call('/start', mocked.msg, ['/start']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, 'Tämä on Bläkkisvuohi v3.0 betakomento');
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0);
                mocked.msg.data = 'Juo';
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Viimeisen kolmen tunnin'), -1);
                mocked.msg.data = 'Kalja 33cl 4.7%';
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('‰'), -1);
                mocked.msg.data = 'Kalja 33cl 4.7%';
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 3);
                assert(rows.find(x => x.description === 'Kalja033'));
                done();
            })
            .catch((err) => done(err));
    });

    it('Drinking one beer and pressing back twice should send back to root', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2);
                assert(!rows.find(x => x.description === 'Kalja033'));
                return Commands.call('/start', mocked.msg, ['/start']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, 'Tämä on Bläkkisvuohi v3.0 betakomento');
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0);
                mocked.msg.data = 'Juo';
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Viimeisen kolmen tunnin'), -1);
                mocked.msg.data = 'Kalja 33cl 4.7%';
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('‰'), -1);
                mocked.msg.data = 'Kalja 33cl 4.7%';
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 3);
                assert(rows.find(x => x.description === 'Kalja033'));
                mocked.msg.data = strings.commands.blakkis.back;
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Viimeisen kolmen tunnin'), -1);
                mocked.msg.data = strings.commands.blakkis.back;
                return Commands.call('', mocked.msg, '');
            })
            .then(() => {
                assert.equal(mocked.internals.editText, 'Tämä on Bläkkisvuohi v3.0 betakomento');
                mocked.msg.data = strings.commands.blakkis.back;
                done();
            })
            .catch((err) => done(err));
    });
});