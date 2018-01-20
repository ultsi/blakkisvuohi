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
    terms.js
    unit tests for terms.js functions
*/

/* globals describe, it */

'use strict';
require('../../app/commands/terms.js');

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

describe('terms.js', function() {
    it('Calling /terms should print terms text', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        Commands.call('/terms', mocked.msg, ['/terms'])
        .then(() => {
            try {
                assert.equal(mocked.internals.sentChatId, mocked.privateId);
                assert.equal(mocked.internals.sentText, strings.commands.terms.reply);
                done();
            } catch (err) {
                return Promise.reject(err);
            }
        })
        .catch((err) => done(err));
    });
});