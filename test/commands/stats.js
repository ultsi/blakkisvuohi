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
    stats.js
    unit tests for stats.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/stats.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');

describe('stats.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    it('Calling /stats in group should list basic info with top10Users', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        mocked.msg.chat.id = blakkistest.groups[0].realId;
        Commands.call('/stats', mocked.msg, ['/stats']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 7); // Tilastoja\n\nStats...\n\nTop10 tilastot:\n\n1\n2
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });

    it('Calling /stats in an empty group should list basic info with no top10Users', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.chat.type = 'chat';
        Commands.call('/stats', mocked.msg, ['/stats']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id);
                assert.equal(mocked.internals.sentText.match(/\n/g).length, 6); // Tilastoja\n\nStats...\n\nTop10 tilastot:\n\n
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });

    it('Calling /stats privately should list basic info about user', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = blakkistest.realIds[0];
        Commands.call('/stats', mocked.msg, ['/stats']);
        setTimeout(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert.equal(mocked.internals.sentText.match(/\n/g), null); // Tilastoja\n\nStats...\n\nTop10 tilastot:\n\n
                done();
            } catch (err) {
                done(err);
            }
        }, 50);
    });
});