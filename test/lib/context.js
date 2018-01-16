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
    context.js
    unit tests for context.js functions
*/

/* globals describe, it */

'use strict';

const assert = require('assert');
const contexts = require('../../app/lib/context.js');
const message = require('../../app/lib/message.js');
const blakkistest = require('../blakkistest.js');

describe('context.js', function() {
    describe('Context()', function() {
        it('should return a context object with default values', function() {
            const context = new contexts.Context({}, {});
            assert(context instanceof contexts.Context);
            assert(context.cmd);
            assert(context.msg);
            assert.equal(context.phase, 0);
            assert(context.variables);
        });
    });

    describe('context.storeVariable()', function() {
        it('should store a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.variables.test, Math.PI);
        });

        it('should overwrite a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.variables.test, Math.PI);

            context.storeVariable('test', 0);
            assert.equal(context.variables.test, 0);
        });
    });

    describe('context.fetchVariable()', function() {
        it('should fetch a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.fetchVariable('test'), Math.PI);
        });
    });

    describe('Context.toPhase()', function() {
        it('should change context\'s phase', function() {
            const context = new contexts.Context({}, {});
            assert(context instanceof contexts.Context);
            assert.equal(context.phase, 0);
            context.toPhase('test');
            assert.equal(context.phase, 'test');
        });
    });

    describe('context.end()', function() {
        it('should end context and unset variables', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.fetchVariable('test'), Math.PI);
            assert.equal(context.phase, 0);

            context.end();
            assert(context.fetchVariable('test') === undefined);
            assert(context.phase, -1);
        });
    });

    describe('Context.privateReply()', function() {
        it('should send a private message reply', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'privateReply test';
            context.privateReply(text);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.equal(mocked.internals.sentText, text);
            assert.equal(mocked.internals.sentOptions.reply_to_message_id, mocked.messageId);
        });
    });

    describe('Context.privateReplyWithKeyboard()', function() {
        it('should send a reply with keyboard', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'privateReply keyboard test';
            const kb = [
                ['a', 'b']
            ];
            context.privateReplyWithKeyboard(text, kb);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.equal(mocked.internals.sentText, text);
            assert.equal(mocked.internals.sentOptions.reply_to_message_id, mocked.messageId);
            assert.equal(mocked.internals.sentOptions.reply_markup.keyboard, kb);
        });
    });

    describe('Context.chatReply()', function() {
        it('should send a message reply to chat', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'chatReply keyboard test';
            context.chatReply(text);
            assert.equal(mocked.internals.sentChatId, mocked.chatId);
            assert.equal(mocked.internals.sentText, text);
        });
    });

    describe('Context.photoReply()', function() {
        it('should send a photo reply to chat', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const caption = 'chatReply keyboard test';
            const stream = 'stream';
            context.photoReply(stream, caption);
            assert.equal(mocked.internals.sentChatId, mocked.chatId);
            assert.equal(mocked.internals.sentStream, stream);
            assert.equal(mocked.internals.sentOptions.caption, caption);
        });
    });

    describe('Context.sendMessage()', function() {
        it('should do nothing with a invalid message object', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            context.sendMessage();
            assert.equal(mocked.internals.sentChatId, false);
            assert.equal(mocked.internals.sentText, false);
            assert.equal(mocked.internals.sentOptions, false);
        });

        it('should send a private message with message.PrivateMessage', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'sendMessage test 1';
            const privMsg = message.PrivateMessage(text);
            context.sendMessage(privMsg);
            assert.equal(mocked.internals.sentChatId, mocked.privateId);
            assert.equal(mocked.internals.sentText, text);
        });

        it('should send a chat message with message.ChatMessage', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'sendMessage test 2';
            const chatMsg = message.ChatMessage(text);
            context.sendMessage(chatMsg);
            assert.equal(mocked.internals.sentChatId, mocked.chatId);
            assert.equal(mocked.internals.sentText, text);
        });

        it('should send a photo with message.Photo', function() {
            const mocked = blakkistest.mockMsgAndBot();
            const context = new contexts.Context({}, mocked.msg);
            const text = 'sendMessage test 2';
            const photoMsg = message.Photo(text);
            context.sendMessage(photoMsg);
            assert.equal(mocked.internals.sentChatId, mocked.chatId);
            assert.equal(mocked.internals.sentStream, text);
        });
    });
});