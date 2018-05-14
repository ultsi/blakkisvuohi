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
    inline-keyboard-command.js
    Inline-keyboard-command class with helpers
*/

'use strict';

const log = require('loglevel').getLogger('system');
const errors = require('./errors.js');
const strings = require('../strings.js');

class InlineKeyboardCommand {
    constructor(definition, parent) {
        if (!definition._root && !parent) {
            throw new errors.InvalidInlineCommand('no _root in parentless command definition');
        }

        this.parent = parent || false;
        this.root = definition._root ? true : false;
        this.userRequired = definition._userRequired ? true : false;
        this.adminRequired = definition._adminRequired ? true : false;
        this.nonUserRequired = definition._nonUserRequired ? true : false;
        this.text = definition._text ? definition._text : false;
        this.onSelectAction = definition._onSelect ? definition._onSelect : false;
        this.onTextAction = definition._onText ? definition._onText : false;
        this.children = {};
        this.childrenArray = [];

        for (let i in definition) {
            if (i[0] !== '_') {
                let cmdDefinition = definition[i];
                let cmd = new InlineKeyboardCommand(cmdDefinition, this);
                this.children[i] = cmd;
                this.childrenArray.push(cmd);
            }
        }
    }

    isAvailableForUser(user) {
        if (user) {
            if (this.nonUserRequired || (this.adminRequired && !user.isAdmin())) {
                return false;
            }
            return true;
        } else {
            if (this.userRequired || this.adminRequired) {
                return false;
            }
            return true;
        }
    }

    getInlineKeyboard(user) {
        let inlineKeyboard = [];
        let pair = [];
        for (let i in this.children) {
            let child = this.children[i];
            if (child.isAvailableForUser(user)) {
                pair.push({
                    text: i,
                    callback_data: i
                });
            }
            if (pair.length === 2) {
                inlineKeyboard.push(pair);
                pair = [];
            }
        }
        if (!this.root) {
            pair.push({
                text: strings.commands.blakkis.back,
                callback_data: strings.commands.blakkis.back
            });
            inlineKeyboard.push(pair);
            pair = [];
        }
        if (pair.length !== 0) {
            inlineKeyboard.push(pair);
        }
        return inlineKeyboard;
    }

    getChild(name) {
        return this.children[name];
    }

    getParent() {
        return this.parent;
    }

    sendTextAndKeyboard(text, context, user, msg) {
        if (msg.message) {
            return context.inlineKeyboardEdit(text, this.getInlineKeyboard(user));
        } else {
            return context.inlineKeyboardMessage(text, this.getInlineKeyboard(user));
        }
    }

    onSelect(context, user, msg, words) {
        if (this.onSelectAction) {
            return this.onSelectAction(context, user, msg, words)
                .then((text) => {
                    return this.sendTextAndKeyboard(text, context, user, msg);
                });
        } else {
            return this.sendTextAndKeyboard(this.text, context, user, msg);
        }
    }

    onText(context, user, msg, words) {
        if (this.onTextAction) {
            return this.onTextAction(context, user, msg, words)
                .then((res) => {
                    if (typeof res === 'string') {
                        return context.inlineKeyboardMessage(res, this.getInlineKeyboard(user));
                    } else if (typeof res === 'object') {
                        return context.privateReplyWithKeyboard(res.text, res.keyboard);
                    }
                });
        }
    }

}

module.exports = InlineKeyboardCommand;