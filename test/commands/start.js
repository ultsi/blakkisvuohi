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
    start.js
    unit tests for start.js functions
*/

/* globals describe, it, beforeEach */

'use strict'
require('../../src/commands/start.js')

const assert = require('assert')
import * as blakkistest from '../blakkistest'
import * as Commands from '../../src/lib/commands'
import * as strings from '../../src/strings'
import * as users from '../../src/db/users'

describe('start.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks)
    it('Calling /start should print normal text', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.juo.button_text
                mocked.msg.addMessageObj()
                done()
            })
            .catch((err) => done(err))
    })

    it('Selecting Juo should print Juo text', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.juo.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Juo'), -1)
                done()
            })
            .catch((err) => done(err))
    })

    it('Selecting Juo and then Kalja should drink the beer', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        const user = blakkistest.users[0]
        mocked.msg.from.id = blakkistest.realIds[0]

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2)
                assert(!rows.find(x => x.description === strings.emoji.beer + ' 33cl 4.7%'))
                return Commands.call('/start', mocked.msg, ['/start'])
            })
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.juo.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Juo'), -1)
                mocked.msg.data = '/start ' + strings.commands.start.juo.miedot.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                mocked.msg.data = '/start ' + strings.emoji.beer + ' 33cl 4.7%'
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                return user.getBooze()
            })
            .then((rows) => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                assert.equal(rows.length, 3)
                assert(rows.find(x => x.description === strings.emoji.beer + ' 33cl 4.7%'))
                done()
            })
            .catch((err) => done(err))
    })

    it('Drinking one beer and pressing back thrice should send back to root', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        const user = blakkistest.users[0]
        mocked.msg.from.id = blakkistest.realIds[0]

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2)
                assert(!rows.find(x => x.description === strings.emoji.beer + ' 33cl 4.7%'))
                return Commands.call('/start', mocked.msg, ['/start'])
            })
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.juo.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Juo'), -1)
                mocked.msg.data = '/start ' + strings.commands.start.juo.miedot.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                mocked.msg.data = '/start ' + strings.emoji.beer + ' 33cl 4.7%'
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                return user.getBooze()
            })
            .then((rows) => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Miedot'), -1)
                assert.equal(rows.length, 3)
                assert(rows.find(x => x.description === strings.emoji.beer + ' 33cl 4.7%'))
                mocked.msg.data = '/start ' + strings.commands.blakkis.back
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Juo'), -1)
                mocked.msg.data = '/start ' + strings.commands.blakkis.back
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, '')
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf('Bäää - Bläkkisvuohi'), -1)
                mocked.msg.data = '/start ' + strings.commands.blakkis.back
                mocked.msg.addMessageObj()
                done()
            })
            .catch((err) => done(err))
    })
})

describe('start/asetukset.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks)
    it('Going to asetukset should print correct header and text and options', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.on_select), -1)
                assert.notEqual(mocked.internals.editOptions.reply_markup.inline_keyboard.length, 0)
                done()
            })
            .catch((err) => done(err))
    })

    it('Asetukset->Muokkaa should show correct text and options', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.msg.from.id)
                assert.notEqual(mocked.internals.sentText.indexOf('Bäää'), -1)
                assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.on_select), -1)
                assert.notEqual(mocked.internals.editOptions.reply_markup.inline_keyboard.length, 0)
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.muokkaa.on_select.substring(0, 10)), -1)
                assert.notEqual(mocked.internals.editText.indexOf(blakkistest.users[0].username), -1)
                assert.notEqual(mocked.internals.editOptions.reply_markup.inline_keyboard.length, 0)
                done()
            })
            .catch((err) => done(err))
    })

    it('Asetukset->Muokkaa->Paino should show correct texts and editing weight should work', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.paino.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.muokkaa.paino.on_select.substring(0, 5)), -1)
                assert.notEqual(mocked.internals.editText.indexOf(blakkistest.users[0].weight), -1)
                return Commands.call('120', mocked.msg, ['120'])
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.start.asetukset.muokkaa.paino.on_change), -1)

                return users.find(mocked.msg.from.id)
            })
            .then((user) => {
                assert.notEqual(user.weight, blakkistest.users[0].weight)
                done()
            })
            .catch((err) => done(err))
    })

    it('Asetukset->Muokkaa->Pituus should show correct texts and editing height should work', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.pituus.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.muokkaa.pituus.on_select.substring(0, 5)), -1)
                assert.notEqual(mocked.internals.editText.indexOf(blakkistest.users[0].height), -1)
                return Commands.call('140', mocked.msg, ['140'])
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.start.asetukset.muokkaa.pituus.on_change), -1)

                return users.find(mocked.msg.from.id)
            })
            .then((user) => {
                assert.notEqual(user.height, blakkistest.users[0].height)
                done()
            })
            .catch((err) => done(err))
    })

    it('Asetukset->Muokkaa->Sukupuoli should show correct texts and editing gender should work', function(done) {
        const mocked = blakkistest.mockMsgAndBot()
        mocked.msg.from.id = blakkistest.realIds[0]
        Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                mocked.msg.data = '/start ' + strings.commands.start.asetukset.muokkaa.sukupuoli.button_text
                mocked.msg.addMessageObj()
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.muokkaa.sukupuoli.on_select.substring(0, 5)), -1)
                assert.notEqual(mocked.internals.editText.indexOf(blakkistest.users[0].gender), -1)
                mocked.msg.addMessageObj()
                mocked.msg.data = '/start ' + 'Nainen'
                return Commands.call('', mocked.msg, [''])
            })
            .then(() => {
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.header_title), -1)
                assert.notEqual(mocked.internals.editText.indexOf(strings.commands.start.asetukset.muokkaa.sukupuoli.on_change), -1)

                return users.find(mocked.msg.from.id)
            })
            .then((user) => {
                assert.notEqual(user.gender, blakkistest.users[0].gender)
                done()
            })
            .catch((err) => done(err))
    })
})