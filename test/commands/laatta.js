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
const strings = require('../../app/strings.js');

describe('laatta.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /laatta should ask for confirmation', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/laatta', mocked.msg, ['/laatta'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, strings.commands.laatta.start_text);
                assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /laatta should ask for confirmation again if answer is not one of the options', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/laatta', mocked.msg, ['/laatta'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, strings.commands.laatta.start_text);
                assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                return Commands.call('test', mocked.msg, ['test']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText, strings.commands.laatta.error_text);
                assert.notEqual(mocked.internals.sentOptions.reply_markup.keyboard.length, 0);
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /laatta should undo if option yes is selected', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2);
                return Commands.call('/laatta', mocked.msg, ['/laatta']);
            })
            .then(() => {
                return Commands.call(strings.commands.laatta.start_answer_yes, mocked.msg, [strings.commands.laatta.start_answer_yes]);
            }) // yes option)
            .then(() => user.getBooze())
            .then((rows) => {
                assert.equal(rows.length, 1);
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /laatta should not undo if option no is selected', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2);
                return Commands.call('/laatta', mocked.msg, ['/laatta']);
            })
            .then(() => {
                return Commands.call(strings.commands.laatta.start_answer_no, mocked.msg, [strings.commands.laatta.start_answer_no]);
            }) // no option)
            .then(() => user.getBooze())
            .then((rows) => {
                assert.equal(rows.length, 2);
                done();
            })
            .catch((err) => done(err));
    });
});