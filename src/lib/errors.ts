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
    errors.ts
    Contains all errors
*/

export class PrivateCommandUsedInChat extends Error {
    constructor(cmd) {
        super(`Private command ${cmd} used in chat.`)
    }
}

export class ChatCommandUsedInPrivate extends Error {
    constructor(cmd) {
        super(`Chat command ${cmd} used in private.`)
    }
}

export class ContextEnded extends Error {
    constructor(cmd) {
        super(`Context ended for cmd ${cmd}.`)
    }
}

export class UserNotFound extends Error {
    constructor() {
        super('User not found!')
    }
}

export class UserNotAdmin extends Error {
    constructor(user) {
        super(`User ${user.userId} is not admin.`)
    }
}

export class UserNotReadTerms extends Error {
    constructor(user) {
        super(`User ${user.userId} has not read terms`)
    }
}

export class InvalidInlineCommand extends Error {
    constructor(reason) {
        super(`Inline Command is invalid: ${reason}`)
    }
}
