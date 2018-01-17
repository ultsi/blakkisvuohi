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
    promillet.js
    unit tests for promillet.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/promillet.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');

describe('promillet.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /promillet in group should list 2 users with permilles in group with group title', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        mocked.msg.chat.id = blakkistest.groups[0].realId;
        Commands.call('/promillet', mocked.msg, ['/promillet']);
        setTimeout(() => {
            try {
                console.log(mocked.internals);
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 4); // 1 header line + 2 breaks + 2 users separated by 1 linebreak
                assert.notEqual(mocked.internals.sentText.match(mocked.msg.chat.title), null);
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });

    it('Calling /promillet in an empty group should list no users', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        Commands.call('/promillet', mocked.msg, ['/promillet']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 3);  // 1 header line + 2 breaks + 0 users
                assert.notEqual(mocked.internals.sentText.match(mocked.msg.chat.title), null);
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });

    it('Calling /promillet privately should list user\'s own permilles', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/promillet', mocked.msg, ['/promillet']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);  // 1 header line + 2 breaks + 0 users
                assert(mocked.internals.sentText.match('‰'));
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });
});