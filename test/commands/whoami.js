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
    whoami.js
    unit tests for whoami.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/whoami.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');

describe('whoami.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /whoami should print user\'s data', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/whoami', mocked.msg, ['/whoami'])
            .then(() => {
                try {
                    assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                    assert.notEqual(mocked.internals.sentText.match(user.userId), null);
                    assert.notEqual(mocked.internals.sentText.match(user.username), null);
                    assert.notEqual(mocked.internals.sentText.match(user.weight), null);
                    assert.notEqual(mocked.internals.sentText.match(user.height), null);
                    assert.notEqual(mocked.internals.sentText.match(user.gender), null);
                    done();
                } catch (err) {
                    return Promise.reject(err);
                }
            })
            .catch((err) => done(err));
    });
});