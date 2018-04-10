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
    utils.js
    Commonly used functions.
*/

'use strict';

const log = require('loglevel').getLogger('system');
const constants = require('../constants.js');
const crypto = require('crypto');
const _secret_ = process.env.SECRET;
let utils = module.exports = {};

utils.getDateMinusHours = function(hours) {
    const hoursAgo = new Date(Date.now() - hours * constants.HOUR_IN_MILLIS);
    return hoursAgo;
};

function createSendPrivateMsgFunction(msg, bot) {
    return function(text) {
        return bot.sendMessage(msg.from.id, text)
            .then(() => {
                log.debug('sent ' + text + ' to ' + msg.from.username);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send private msg! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    };
}

function createSendChatMsgFunction(msg, bot) {
    return function(text) {
        return bot.sendMessage(msg.chat.id, text)
            .then(() => {
                log.debug('sent ' + text + ' to chat ' + msg.chat.title);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send chat msg! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    };
}

function createSendMsgToFunction(msg, bot) {
    return function(chatId, text, options) {
        return bot.sendMessage(chatId, text, options)
            .then(() => {
                log.debug('sent ' + text + ' to chat ' + chatId);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send msg! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    };
}

function createSendPhotoFunction(msg, bot) {
    return function(chatId, stream, options) {
        return bot.sendPhoto(chatId, stream, options)
            .then(() => {
                log.debug('sent photo to chat ' + chatId);
                return Promise.resolve();
            }).catch((err) => {
                log.error('couldn\'t send photo! Err: ' + err);
                log.debug(err.stack);
                return Promise.reject(err);
            });
    };
}

utils.hookNewRelic = function(url, func) {
    return new Promise(function(resolve, reject) {
        if (global.newrelic && global.newrelic.startWebTransaction) {
            global.newrelic.startWebTransaction(url, function() {
                let p = func();
                if (p && p.then) {
                    p.then(() => {
                        global.newrelic.getTransaction().end();
                        resolve();
                    }).catch((err) => {
                        global.newrelic.noticeError(err);
                        global.newrelic.getTransaction().end();
                        reject(err);
                    });
                } else {
                    global.newrelic.getTransaction().end();
                    resolve();
                }
            });
        } else {
            let p = func();
            if (p && p.then) {
                p.then(() => {
                    resolve();
                }).catch((err) => reject(err));
            } else {
                resolve();
            }
        }
    });
};

utils.attachMethods = function attachMethods(msg, bot) {
    msg.sendPrivateMessage = createSendPrivateMsgFunction(msg, bot);
    msg.sendChatMessage = createSendChatMsgFunction(msg, bot);
    msg.sendMessage = createSendMsgToFunction(msg, bot);
    msg.sendPhoto = createSendPhotoFunction(msg, bot);
};

utils.roundTo = (n, t) => {
    t = t || 0;
    return Math.round(n * (Math.pow(10, t))) / Math.pow(10, t);
};

utils.getRandomFromArray = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

utils.isValidInt = function(num) {
    const n = Number(num);
    const int = parseInt(num, 10);
    return !isNaN(int) && (typeof int === 'number' || int instanceof Number) && int === n;
};

utils.isValidFloat = function(num) {
    const n = utils.toNumber(num);
    const float = utils.parseFloat(num);
    return !isNaN(float) && (typeof float === 'number' || float instanceof Number) && float === n;
};

utils.parseFloat = function(num) {
    if(typeof num === 'string') {
        // convert , to .
        return parseFloat(num.replace(/\,/g, '.'));
    } else if (typeof num === 'number') {
        return parseFloat(num);
    } else {
        return NaN;
    }
};

utils.toNumber = function(num) {
    if(typeof num === 'string') {
        // convert , to .
        return Number(num.replace(/\,/g, '.'));
    } else if (typeof num === 'number') {
        return Number(num);
    } else {
        return NaN;
    }
};

/*
    Wad's 16 color palette
    http://alumni.media.mit.edu/~wad/color/numbers.html
*/
const wadsPalette = [
    [0, 0, 0], // Black
    [87, 87, 87], // Dk. Gray
    [173, 35, 35], // Red
    [42, 75, 215], // Blue
    [29, 105, 20], // Green
    [129, 74, 25], // Brown
    [129, 38, 192], // Purple
    [160, 160, 160], // Lt. Gray
    [129, 197, 122], // Lt. Green
    [157, 175, 255], // Lt. Blue
    [41, 208, 208], // Cyan
    [255, 146, 51], // Orange
    [255, 238, 51], // Yellow
    [233, 222, 187], // Tan
    [255, 205, 243] // Pink
    // [255, 255, 255] // White
];

utils.getColorSet = function() {
    return [].concat(wadsPalette); // return a copy
};

utils.hashSha256 = function(data) {
    const hash = crypto.createHash('sha256');
    hash.update('' + data); // tostring
    return hash.digest('hex');
};

utils.encrypt = function(data) {
    const cipher = crypto.createCipher('aes192', _secret_);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

utils.decrypt = function(data) {
    const cipher = crypto.createDecipher('aes192', _secret_);
    let encrypted = cipher.update(data, 'hex', 'utf8');
    encrypted += cipher.final('utf8');
    return encrypted;
};

/*
    Placeholder string format
    https://stackoverflow.com/questions/18405736/is-there-a-c-sharp-string-format-equivalent-in-javascript
*/
String.prototype.format = function(placeholders) {
    let s = this;
    for (let propertyName in placeholders) {
        let re = new RegExp('{' + propertyName + '}', 'gm');
        s = s.replace(re, placeholders[propertyName]);
    }
    return s;
};

String.prototype.unformat = function() {
    return this.replace(/{.+}/g, '');
};