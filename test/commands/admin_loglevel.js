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
    admin_loglevel.js
    unit tests for admin_loglevel.js functions
*/

/* globals describe, it, after */

'use strict';
require('../../app/commands/admin_loglevel.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const settings = require('../../app/settings.js');
const log = require('loglevel');

describe('admin_loglevel.js', function() {
    it('Calling /admin_loglevel without arguments should change \'commands\' level to \'info\'', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = settings.admin_id;
        log.getLogger('commands').setLevel(log.levels.DEBUG);
        assert.equal(log.getLogger('commands').getLevel(), log.levels.DEBUG);
        Commands.call('/admin_loglevel', mocked.msg, ['/admin_loglevel'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert(mocked.internals.sentText.length > 10);
                assert.equal(log.getLogger('commands').getLevel(), log.levels.INFO);
                done();
            }).catch((err) => done(err));
    });

    it('Calling /admin_loglevel with arguments system debug should change \'system\' level to \'debug\'', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = settings.admin_id;
        log.getLogger('system').setLevel(log.levels.INFO);
        assert.equal(log.getLogger('system').getLevel(), log.levels.INFO);
        Commands.call('/admin_loglevel', mocked.msg, ['/admin_loglevel', 'system', 'debug'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert(mocked.internals.sentText.length > 10);
                assert.equal(log.getLogger('system').getLevel(), log.levels.DEBUG);
                done();
            }).catch((err) => done(err));
    });

    it('Calling /admin_loglevel with arguments db info should change \'db\' level to \'info\'', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        mocked.msg.from.id = settings.admin_id;
        log.getLogger('db').setLevel(log.levels.DEBUG);
        assert.equal(log.getLogger('db').getLevel(), log.levels.DEBUG);
        Commands.call('/admin_loglevel', mocked.msg, ['/admin_loglevel', 'db', 'info'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                assert(mocked.internals.sentText.length > 10);
                assert.equal(log.getLogger('db').getLevel(), log.levels.INFO);
                done();
            }).catch((err) => done(err));
    });

    after(function() {
        log.getLogger('system').setLevel('info');
        log.getLogger('db').setLevel('info');
        log.getLogger('commands').setLevel('info');
    });
});