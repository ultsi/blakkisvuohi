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
    message.js
    Message class for various forms of messages available
*/
'use strict'

/*
    Types available
    chat_message
    private_message
    reply (replies to a message)
    photo
*/

export function Message(text, options = null) {
    this.text = text
    this.options = options
    this.type = 'message'
}

export function ChatMessage(text, options = null) {
    const msg = new Message(text, options)
    msg.type = 'chat_message'
    return msg
}

export function PrivateMessage(text, options = null) {
    let msg = new Message(text, options)
    msg.type = 'private_message'
    return msg
}

export function PrivateKeyboardMessage(text, keyboardButtons) {
    let options = {
        'parse_mode': 'Markdown',
        'reply_markup': {
            'keyboard': keyboardButtons,
            'resize_keyboard': true,
            'one_time_keyboard': false
        }
    }
    return PrivateMessage(text, options)
}

export function Photo(buffer, caption) {
    let options = {
        caption: caption
    }
    let msg = new Message('photo', options)
    msg.type = 'photo'
    msg.buffer = buffer
    return msg
}