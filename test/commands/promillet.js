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
const strings = require('../../app/strings.js');

describe('promillet.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /promillet in group should list 2 users with permilles in group with group title', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        mocked.msg.chat.id = blakkistest.groups[0].realId;
        Commands.call('/promillet', mocked.msg, ['/promillet'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.promillet.text_group.unformat()), -1);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 4); // 1 header line + 2 breaks + 2 users separated by 1 linebreak
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /promillet in an empty group should list no users', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        Commands.call('/promillet', mocked.msg, ['/promillet'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.promillet.text_group.unformat()), -1);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 3); // 1 header line + 2 breaks + 0 users
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /promillet privately should list user\'s own permilles', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/promillet', mocked.msg, ['/promillet'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id); // 1 header line + 2 breaks + 0 users
                assert.notEqual(mocked.internals.sentText.match('‰'), null);
                done();
            })
            .catch((err) => done(err));
    });
});