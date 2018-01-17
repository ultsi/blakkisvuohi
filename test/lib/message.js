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
    message.js
    unit tests for message.js functions
*/

/* globals describe, it */

'use strict';
const assert = require('assert');
const message = require('../../app/lib/message.js');

describe('message.js', function() {
    describe('new Message()', function() {
        it('should return a new Message object', function(){
            const msg = new message.Message('text', {});
            assert(msg instanceof message.Message);
        });
    });

    describe('ChatMessage()', function() {
        it('should return a new Message object, that has type "chat_message"', function(){
            const msg = message.ChatMessage('text', {});
            assert(msg instanceof message.Message);
            assert.equal(msg.type, 'chat_message');
        });
    });

    describe('PrivateMessage()', function() {
        it('should return a new Message object, that has type "private_message"', function(){
            const msg = message.PrivateMessage('text', {});
            assert(msg instanceof message.Message);
            assert.equal(msg.type, 'private_message');
        });
    });

    describe('PrivateMessage()', function() {
        it('should return a new Message object, that has type "private_message"', function(){
            const msg = message.PrivateMessage('text', {});
            assert(msg instanceof message.Message);
            assert.equal(msg.type, 'private_message');
        });
    });

    describe('PrivateKeyboardMessage()', function() {
        it('should return a new Message object, that has type "private_message" and has keyboard options', function(){
            const keyboard = [['A', 'B']];
            const msg = message.PrivateKeyboardMessage('text', keyboard);
            assert(msg instanceof message.Message);
            assert.equal(msg.type, 'private_message');
            assert.equal(msg.options.parse_mode, 'Markdown');
            assert.equal(msg.options.reply_markup.keyboard, keyboard);
        });
    });

    describe('Photo()', function() {
        it('should return a new Message object, that has type "photo"', function(){
            const msg = message.Photo('text');
            assert(msg instanceof message.Message);
            assert.equal(msg.type, 'photo');
        });
    });
});