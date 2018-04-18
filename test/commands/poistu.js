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
    poistu.js
    tests for poistu.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/poistu.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const groups = require('../../app/db/groups.js');
const strings = require('../../app/strings.js');

describe('poistu.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /poistu should join the user to the group', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const groupId = mocked.chatId + 1;
        const group = new groups.Group(groupId);
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.id = groupId;
        mocked.msg.chat.type = 'chat';

        group.getDrinkSum()
            .then((res) => {
                assert.equal(res.sum, 0);
                return Commands.call('/moro', mocked.msg, ['/moro']);
            })
            .then(() => group.getDrinkSum())
            .then((res) => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText, strings.commands.moro.join_text.format({
                    chat_title: mocked.msg.chat.title
                }));
                assert.equal(res.sum, 12347 * 2);
                return Commands.call('/poistu', mocked.msg, ['/poistu']);
            })
            .then(() => group.getDrinkSum())
            .then((res) => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText, strings.commands.poistu.leave_text.format({
                    chat_title: mocked.msg.chat.title
                }));
                assert.equal(res.sum, 0);
                done();
            })
            .catch((err) => done(err));
    });
});