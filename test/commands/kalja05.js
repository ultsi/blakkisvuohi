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
    kalja05.js
    unit tests for kalja05.js functions
*/

/* globals describe, it, beforeEach */

'use strict'
require('../../src/commands/kalja05.js')

const assert = require('assert')
import * as blakkistest from '../blakkistest'
import * as Commands from '../../src/lib/commands'

describe('kalja05.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks)
    it('Calling /kalja05 should add a drink to db for the user and return ebac', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        const user = blakkistest.users[0]
        mocked.msg.from.id = blakkistest.realIds[0]

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2)
                assert(!rows.find(x => x.description === '/kalja05'))
                return Commands.call('/kalja05', mocked.msg, ['/kalja05'])
            })
            .then(() => user.getBooze())
            .then((rows) => {
                assert.equal(rows.length, 3)
                assert(rows.find(x => x.description === '/kalja05'))
                assert.notEqual(mocked.internals.sentText.match('‰'), null)
                done()
            })
            .catch((err) => done(err))
    })
})