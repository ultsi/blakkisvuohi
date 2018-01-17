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
    moro.js
    unit tests for moro.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/moro.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const groups = require('../../app/db/groups.js');

describe('moro.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /moro should join the user to the group', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        const groupId = mocked.chatId + 1;
        const group = new groups.Group(groupId);
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.id = groupId;
        mocked.msg.chat.type = 'chat';

        group.getDrinkSum()
            .then((res) => {
                try {
                    assert.equal(res.sum, 0);
                } catch (err) {
                    return Promise.reject(err);
                }
                Commands.call('/moro', mocked.msg, ['/moro']);
                let p = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(group.getDrinkSum());
                    }, 50);
                });
                return p;
            })
            .then((res) => {
                try {
                    assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                    assert.equal(res.sum, 12347*2);
                } catch (err) {
                    return Promise.reject(err);
                }
                done();
            })
            .catch((err) => done(err));
    });
});