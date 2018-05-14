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
    errors.js
    Contains all errors
*/

const errors = module.exports = {};

errors.PrivateCommandUsedInChat = class extends Error {
  constructor(cmd) {
    super(`Private command ${cmd} used in chat.`);
  }
};

errors.ChatCommandUsedInPrivate = class extends Error {
  constructor(cmd) {
    super(`Chat command ${cmd} used in private.`);
  }
};

errors.ContextEnded = class extends Error {
  constructor(cmd) {
    super(`Context ended for cmd ${cmd}.`);
  }
};

errors.UserNotFound = class extends Error {
  constructor() {
    super('User not found!');
  }
};

errors.UserNotAdmin = class extends Error {
  constructor(user) {
    super(`User ${user.userId} is not admin.`);
  }
};

errors.UserNotReadTerms = class extends Error {
  constructor(user) {
    super(`User ${user.userId} has not read terms`);
  }
};

errors.InvalidInlineCommand = class extends Error {
  constructor(reason) {
    super(`Inline Command is invalid: ${reason}`);
  }
};