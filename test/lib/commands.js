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
    commands.js
    unit tests for commands.js functions
*/

/* globals describe, it, beforeEach */

'use strict';

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const mocked = blakkistest.mockMsgAndBot();
const Commands = require('../../app/lib/commands.js');
require('../../app/commands/help.js');
require('../../app/commands/komennot.js');
require('../../app/commands/start.js');
const Message = require('../../app/lib/message.js');
const strings = require('../../app/strings.js');

const testCommand = {
    [0]: {
        startMessage: Message.PrivateMessage('test'),
        validateInput: () => {
            return true;
        },
        onValidInput: (context) => {
            return context.end();
        }
    }
};

describe('commands.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    describe('Commands.register()', function() {
        it('should register a command that can be called', function() {
            let msg = Object.assign(mocked.msg); // copy
            Commands.register('/test', 'help', Commands.TYPE_ALL, testCommand);
            Commands.call('/test', msg, ['/test']);
            assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
            assert.equal(mocked.internals.sentText, 'test');
        });
    });

    describe('Commands.registerUserCommand()', function() {
        it('should register a command that can be called by a valid user', function(done) {
            let msg = Object.assign(mocked.msg); // copy
            msg.from.id = blakkistest.realIds[0];
            Commands.registerUserCommand('/testusercommand', 'help', Commands.TYPE_ALL, [() => {
                done();
                return Promise.resolve();
            }]);
            Commands.call('/testusercommand', msg, ['/testusercommand']);
        });

        it('a user command should not be able to be called by a non-user', function(done) {
            this.slow(200);
            let msg = Object.assign(mocked.msg); // copy
            msg.from.id = 0; // non user id
            Commands.registerUserCommand('/testusercommand2', 'help', Commands.TYPE_ALL, [() => {
                done(new Error('non user used a user command'));
                return Promise.resolve();
            }]);
            Commands.call('/testusercommand2', msg, ['/testusercommand2']);
            setTimeout(() => done(), 50);
        });

        it('a private user command should not be able to be called in a chat', function(done) {
            this.slow(200);
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            mocked.msg.chat.type = 'chat';
            Commands.registerUserCommand('/testusercommand2', 'help', Commands.TYPE_PRIVATE, [() => {
                done(new Error('private command used in chat'));
                return Promise.resolve();
            }]);
            Commands.call('/testusercommand2', mocked.msg, ['/testusercommand2']);
            setTimeout(() => done(), 50);
        });
    });

    describe('Commands.call()', function() {
        it('should send help string msg privately with /start', function() {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/start', mocked.msg, ['/start']);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.equal(mocked.internals.sentText, strings.commands.blakkis.help_text);
        });

        it('should send cmds string msg privately with /komennot', function() {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/komennot', mocked.msg, ['/komennot']);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.cmd_list.unformat()), -1);
        });

        it('should send help string and cmds string msg privately with /help', function() {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/help', mocked.msg, ['/help']);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.cmd_list.unformat()), -1);
            assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.help_text.unformat()), -1);
        });

        it('a private command should not be able to called from a chat and a msg is sent to the initiating user', function() {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.chat.type = 'chat';
            Commands.register('/private_command', 'help', Commands.TYPE_PRIVATE, [() => {}]);
            Commands.call('/private_command', mocked.msg, ['/private_command']);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
        });
    });
});