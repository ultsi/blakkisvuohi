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
    kuvaaja.js
    unit tests for kuvaaja.js functions
*/

/* globals describe, it, beforeEach */

'use strict'
require('../../src/commands/kuvaaja.js')

const assert = require('assert')
import * as blakkistest from '../blakkistest'
import * as Commands from '../../src/lib/commands'

describe('kuvaaja.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks)
    it('Calling /kuvaaja should sent a photo to the group', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        mocked.msg.chat.type = 'chat'
        mocked.msg.chat.id = blakkistest.groups[0].realId
        Commands.call('/kuvaaja', mocked.msg, ['/kuvaaja'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.chat.id)
                assert.notEqual(mocked.internals.sentStream, false)
                done()
            })
            .catch((err) => done(err))
    })
})