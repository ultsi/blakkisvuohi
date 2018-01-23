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
    jalkikellotus.js
    unit tests for jalkikellotus.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/jalkikellotus.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

describe('jalkikellotus.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    it('Calling /jalkikellotus and inserting two drinks should save them into db', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/jalkikellotus', mocked.msg, ['/jalkikellotus']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.jalkikellotus.start);
                mocked.msg.text = '2';
                return Commands.call('2', mocked.msg, ['2']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.jalkikellotus.input_drinks_start);
                mocked.msg.text = 'kalja 33 4.7';
                return Commands.call('kalja', mocked.msg, ['kalja', '33', '4.7']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.jalkikellotus.input_drinks_start);
                mocked.msg.text = 'kalja 33 4.7';
                return Commands.call('kalja', mocked.msg, ['kalja', '33', '4.7']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.jalkikellotus.input_drinks_start);
                mocked.msg.text = 'stop';
                return Commands.call('stop', mocked.msg, ['stop']);
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf('‰'), -1);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 4); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });
});