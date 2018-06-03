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
    inline-commands.js
    tests for inline-commands.js functions
*/

/* globals describe, it, beforeEach */

'use strict';

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const mocked = blakkistest.mockMsgAndBot();
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

const mockCmdName = '/testinline',
    mockCmdHelp = 'help',
    mockCmdScope = Commands.SCOPE_PRIVATE,
    mockCmdPrivilege = Commands.PRIVILEGE_ALL,
    mockCmdType = Commands.TYPE_INLINE,
    mockCmdDefinition = {
        _text: 'root',
        _root: true,
        _formHeader: () => Promise.resolve(''),
        _headerTitle: 'header',
        button1: {
            _text: 'button1 pressed',
            dummy_child: {}
        },
        userButton: {
            _text: 'userButton pressed',
            _userRequired: true,
            dummy_child: {}
        },
        adminButton: {
            _text: 'adminButton pressed',
            _adminRequired: true,
            dummy_child: {}
        },
        nonUserButton: {
            _text: 'non user button pressed',
            _nonUserRequired: true,
            dummy_child: {}
        }
    };

function registerMockCmd() {
    Commands.register(mockCmdName, mockCmdHelp, mockCmdScope, mockCmdPrivilege, mockCmdType, mockCmdDefinition);
}

describe('commands.js (inline)', () => {
    describe('Commands.registerCommand()', () => {
        it('should register a valid command with no errors', () => {
            registerMockCmd();
        });
    });

    describe('InlineCommands.call()', () => {
        beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
        it('should send correct text with inlinekeyboard buttons upon calling root command name', (done) => {
            registerMockCmd();
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            Commands.call('/testinline', mocked.msg, ['/testinline'])
                .then(() => {
                    assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                    assert.equal(mocked.internals.sentText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    done();
                }).catch((err) => done(err));
        });
        it('should send correct text & a back button after going 1 level deep', (done) => {
            registerMockCmd();
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            Commands.call('/testinline', mocked.msg, ['/testinline'])
                .then(() => {
                    assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                    assert.equal(mocked.internals.sentText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    mocked.msg.data = '/testinline button1';
                    mocked.msg.addMessageObj();
                    return Commands.call('button1', mocked.msg, ['button1']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition.button1._text);
                    assert.equal(mocked.internals.editOptions.reply_markup.inline_keyboard[0][1].text, strings.commands.blakkis.back);
                    done();
                }).catch((err) => done(err));
        });

        it('should show root buttons after going 1 level deep and pressing back', (done) => {
            registerMockCmd();
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            Commands.call('/testinline', mocked.msg, ['/testinline'])
                .then(() => {
                    assert.notEqual(mocked.internals.sentOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    mocked.msg.data = '/testinline button1';
                    mocked.msg.addMessageObj();
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition.button1._text);
                    assert.equal(mocked.internals.editOptions.reply_markup.inline_keyboard[0][1].text, strings.commands.blakkis.back);
                    mocked.msg.data = strings.commands.blakkis.back;
                    mocked.msg.addMessageObj();
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.editOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.editOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.editOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    assert(mocked.internals.editOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'userButton'));
                    done();
                }).catch((err) => done(err));
        });

        it('for no user, should show only basic buttons + non user button & other buttons shouldn\'t do anything', (done) => {
            registerMockCmd();
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = -100;
            Commands.call('/testinline', mocked.msg, ['/testinline'])
                .then(() => {
                    assert.notEqual(mocked.internals.sentOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'nonUserButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'userButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'adminButton'));
                    mocked.msg.data = '/testinline userButton';
                    mocked.msg.addMessageObj();
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, false);
                    assert.equal(mocked.internals.editOptions, false);
                    mocked.msg.data = '/testinline adminButton';
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, false);
                    assert.equal(mocked.internals.editOptions, false);
                    done();
                }).catch((err) => done(err));
        });

        it('for a user, should show basic buttons + user buttons & admin, non-user buttons shouldn\'t do anything', (done) => {
            registerMockCmd();
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            Commands.call('/testinline', mocked.msg, ['/testinline'])
                .then(() => {
                    assert.notEqual(mocked.internals.sentOptions.reply_markup, undefined);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'userButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'adminButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'nonUserButton'));
                    mocked.msg.data = '/testinline userButton';
                    mocked.msg.addMessageObj();
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.notEqual(mocked.internals.editText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.editOptions, false);
                    mocked.msg.data = strings.commands.blakkis.back;
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'userButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'nonUserButton'));
                    mocked.msg.data = '/testinline adminButton';
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition._text);
                    assert.notEqual(mocked.internals.sentOptions.reply_markup.inline_keyboard, undefined);
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'button1'));
                    assert(mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'userButton'));
                    assert(!mocked.internals.sentOptions.reply_markup.inline_keyboard[0].find(x => x.text === 'nonUserButton'));
                    mocked.msg.data = '/testinline nonUserButton';
                    return Commands.call('', mocked.msg, ['']);
                }).then(() => {
                    assert.equal(mocked.internals.editText, mockCmdDefinition._text);
                    done();
                }).catch((err) => done(err));
        });
    });
});