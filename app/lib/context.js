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
    Simple way to 'remember' command context with users
*/

'use strict';

const log = require('loglevel').getLogger('system');
let contexts = module.exports = {};

contexts.Context = function(cmd, msg) {
    this.cmd = cmd;
    this.msg = msg;
    this.phase = 0;
    this.variables = {};
};

contexts.Context.prototype.privateReply = function(text) {
    let self = this;
    let options = {
        'parse_mode': 'Markdown',
        'reply_to_message_id': this.msg.message_id,
        'reply_markup': {
            'remove_keyboard': true
        }
    };
    return self.msg.sendMessage(self.msg.from.id, text, options)
        .then(() => {
            log.debug('Sent ' + text + ' to ' + self.msg.from.username);
            return Promise.resolve();
        }).catch((err) => {
            log.error('couldn\'t send private msg! Err: ' + err);
            log.debug(err.stack);
            return Promise.reject(err);
        });
};

contexts.Context.prototype.privateReplyWithKeyboard = function(text, keyboardButtons) {
    let self = this;
    let options = {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'keyboard': keyboardButtons,
            'resize_keyboard': true,
            'one_time_keyboard': false
        },
        'reply_to_message_id': this.msg.message_id
    };
    return self.msg.sendMessage(self.msg.from.id, text, options)
        .then(() => {
            log.debug('Sent ' + text + ' to ' + self.msg.from.username);
            return Promise.resolve();
        }).catch((err) => {
            log.error('couldn\'t send private msg! Err: ' + err);
            log.debug(err.stack);
            return Promise.reject(err);
        });
};

contexts.Context.prototype.chatReply = function(text) {
    let self = this;
    return self.msg.sendMessage(self.msg.chat.id, text)
        .then(() => {
            log.debug('Sent ' + text + ' to chat ' + self.msg.chat.title);
            return Promise.resolve();
        }).catch((err) => {
            log.error('couldn\'t send chat msg! Err: ' + err);
            log.debug(err.stack);
            return Promise.reject(err);
        });
};

contexts.Context.prototype.photoReply = function(stream, caption) {
    let self = this;
    return self.msg.sendPhoto(self.msg.chat.id, stream, {
            caption: caption
        })
        .then(() => {
            log.debug('Sent a photo to chat ' + self.msg.chat.title);
            return Promise.resolve();
        }).catch((err) => {
            log.error('couldn\'t send photo to chat! Err: ' + err);
            log.debug(err.stack);
            return Promise.reject(err);
        });
};

contexts.Context.prototype.sendMessage = function(message) {
    if (!message || !message.type || !message.text) {
        log.error('sendMessage: invalid message object! ' + message);
        return Promise.reject(new Error('invalid message object'));
    }
    let self = this;

    if (message.type === 'photo') {
        return self.msg.sendPhoto(self.msg.chat.id, message.buffer, message.options)
            .then(() => {
                log.debug('Sent a photo to chat ' + self.msg.chat.title);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send photo to chat! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    } else {
        let to = message.type === 'private_message' ? self.msg.from : self.msg.chat;
        return self.msg.sendMessage(to.id, message.text, message.options)
            .then(() => {
                log.debug('Sent ' + message.text + ' to ' + to.title || to.username || to.first_name);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send msg! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    }
};

contexts.Context.prototype.storeVariable = function(key, value) {
    this.variables[key] = value;
};

contexts.Context.prototype.fetchVariable = function(key) {
    return this.variables[key];
};

contexts.Context.prototype.toPhase = function(phase) {
    this.phase = phase;
};

contexts.Context.prototype.end = function() {
    this.phase = -1;
    this.variables = 0;
    return Promise.resolve();;
};

contexts.Context.prototype.isPrivateChat = function() {
    return this.msg.chat.type === 'private';
};