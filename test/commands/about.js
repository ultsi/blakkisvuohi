/*
    Bläkkisvuohi, a Telegram bot to help track estimated blood alcohol concentration.
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    about.js
    unit tests for about.js functions
*/

/* globals describe, it */

'use strict'
require('../../src/commands/about.js')

const assert = require('assert')
import * as blakkistest from '../blakkistest'
import * as Commands from '../../src/lib/commands'
import * as strings from '../../src/strings'

describe('about.js', function() {
    it('Calling /about should print about text', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        Commands.call('/about', mocked.msg, ['/about'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.privateId)
                assert.equal(mocked.internals.sentText, strings.commands.about.text)
                done()
            }).catch((err) => done(err))
    })
})