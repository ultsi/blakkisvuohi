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
    annokset.js
    unit tests for annokset.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/annokset.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

describe('annokset.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /annokset in group should list 2 users with drinks in group with group title', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        mocked.msg.chat.id = blakkistest.groups[0].realId;
        Commands.call('/annokset', mocked.msg, ['/annokset'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.annokset.text_group.unformat()), -1);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 3); // 1 header line + 2 breaks + 2 users separated by 1 linebreak
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /annokset in an empty group should list no users', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        Commands.call('/annokset', mocked.msg, ['/annokset'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.annokset.text_group.unformat()), -1);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 3); // 1 header line + 2 breaks + 0 users
                done();
            })
            .catch((err) => done(err));
    });

    it('Calling /annokset privately should list user\'s own permilles', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/annokset', mocked.msg, ['/annokset'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id); // 1 header line + 2 breaks + 0 users
                assert.notEqual(mocked.internals.sentText.match('‰'), null);
                done();
            })
            .catch((err) => done(err));
    });
});