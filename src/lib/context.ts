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
    context.js
    Simple way to 'remember' command context with users
*/

'use strict'

import * as loglevel from 'loglevel'
const log = loglevel.getLogger('system')

export class Context {
    private msg: any
    public cmd: any
    private phase: string
    private variables: any
    private inline_ui: any
    private lastSentMessage: any

    constructor(cmd, msg) {
        this.cmd = cmd
        this.msg = msg
        this.phase = 'start'
        this.variables = {}
        this.inline_ui = {
            state: null,
            parent: null
        }
        this.lastSentMessage = {}
    }

    sendMessage(to_id, text, options) {
        options = options ? options : {}
        this.lastSentMessage = {
            to: to_id,
            text: text,
            options: options
        }
        return this.msg.sendMessage(to_id, text, options)
    }

    editMessage(message_id, chat_id, text, options) {
        options = options ? options : {}
        if (!message_id || !chat_id) {
            log.error('message_id and chat_id not both supplied!')
            return Promise.reject(new Error('message_id and chat_id not both supplied!'))
        }
        if (this.lastSentMessage.text === text) {
            // do not send edit query if text wasn't edited
            return Promise.resolve()
        }

        options.message_id = message_id
        options.chat_id = chat_id

        this.lastSentMessage = {
            to: chat_id,
            edit_message_id: message_id,
            text: text,
            options: options
        }

        return this.msg.editMessageText(text, options)
    }

    privateReply(text) {
        let options = {
            'parse_mode': 'Markdown',
            'reply_markup': {
                'remove_keyboard': true
            }
        }
        return this.sendMessage(this.msg.from.id, text, options)
    }

    privateReplyWithKeyboard(text, keyboardButtons) {
        let options = {
            'parse_mode': 'Markdown',
            'reply_markup': {
                'keyboard': keyboardButtons,
                'resize_keyboard': true
            }
        }
        return this.sendMessage(this.msg.from.id, text, options)
    }

    inlineKeyboardMessage(text, inlineKeyboardButtons) {
        let options = {
            'parse_mode': 'Markdown',
            'reply_markup': {
                'inline_keyboard': inlineKeyboardButtons,
                'remove_keyboard': true
            }
        }
        return this.sendMessage(this.msg.from.id, text, options)
    }

    inlineKeyboardEdit(text, inlineKeyboardButtons) {
        const options = {
            'parse_mode': 'Markdown',
            'reply_markup': {
                'inline_keyboard': inlineKeyboardButtons,
                'remove_keyboard': true
            }
        }
        return this.editMessage(this.msg.message.message_id, this.msg.message.chat.id, text, options)
    }

    chatReply(text) {
        return this.msg.sendMessage(this.msg.chat.id, text)
    }

    photoReply(stream, caption) {
        return this.msg.sendPhoto(this.msg.chat.id, stream, {
            caption: caption
        })
    }

    sendMessageObj(message) {
        if (!message || !message.type || !message.text) {
            return Promise.reject(new Error('invalid message object'))
        }

        if (message.type === 'photo') {
            return this.msg.sendPhoto(this.msg.chat.id, message.buffer, message.options)
        } else {
            let to = message.type === 'private_message' ? this.msg.from : this.msg.chat
            return this.msg.sendMessage(to.id, message.text, message.options)
        }
    }

    setInlineState(state) {
        this.inline_ui.state = state
    }

    get state() {
        return this.inline_ui.state
    }

    storeVariable(key, value) {
        this.variables[key] = value
    }

    fetchVariable(key) {
        return this.variables[key]
    }

    forgetVariable(key) {
        this.variables[key] = undefined
    }

    toPhase(phase) {
        this.phase = phase
    }

    end() {
        this.phase = ''
        this.variables = {}
        return Promise.resolve()
    }

    isPrivateChat() {
        return this.msg.chat && this.msg.chat.type === 'private' || this.msg.message && this.msg.message.chat.type === 'private'
    }

    hasEnded() {
        return this.phase === ''
    }
}