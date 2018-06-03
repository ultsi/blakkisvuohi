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
    utils.ts
    Commonly used functions.
*/

'use strict'

import * as crypto from 'crypto'
import * as loglevel from 'loglevel'
const log = loglevel.getLogger('system')
import * as constants from '../constants'
const _secret_ = process.env.SECRET

export function getDateMinusHours(hours) {
    const hoursAgo = new Date(Date.now() - hours * constants.HOUR_IN_MILLIS)
    return hoursAgo
}

function createSendPrivateMsgFunction(msg, bot) {
    return (text) => {
        return bot.sendMessage(msg.from.id, text)
            .then(() => {
                log.debug('sent ' + text + ' to ' + msg.from.username)
                return Promise.resolve()
            }).catch((err) => {
                log.error('couldn\'t send private msg! Err: ' + err)
                log.debug(err.stack)
                return Promise.reject(err)
            })
    }
}

function createSendChatMsgFunction(msg, bot) {
    return (text) => {
        return bot.sendMessage(msg.chat.id, text)
            .then(() => {
                log.debug('sent ' + text + ' to chat ' + msg.chat.title)
                return Promise.resolve()
            }).catch((err) => {
                log.error('couldn\'t send chat msg! Err: ' + err)
                log.debug(err.stack)
                return Promise.reject(err)
            })
    }
}

function createSendMsgToFunction(bot) {
    return (chatId, text, options) => {
        return bot.sendMessage(chatId, text, options)
            .then(() => {
                log.debug('sent ' + text + ' to chat ' + chatId)
                return Promise.resolve()
            }).catch((err) => {
                log.error('couldn\'t send msg! Err: ' + err)
                log.debug(err.stack)
                return Promise.reject(err)
            })
    }
}

function createSendPhotoFunction(bot) {
    return (chatId, stream, options) => {
        return bot.sendPhoto(chatId, stream, options)
            .then(() => {
                log.debug('sent photo to chat ' + chatId)
                return Promise.resolve()
            }).catch((err) => {
                log.error('couldn\'t send photo! Err: ' + err)
                log.debug(err.stack)
                return Promise.reject(err)
            })
    }
}

function createEditMessageTextFunction(bot) {
    return (text, options) => {
        return bot.editMessageText(text, options)
            .then(() => {
                log.debug('edited message')
                return Promise.resolve()
            }).catch((err) => {
                log.error('couldn\'t edit message! Err: ' + err)
                log.debug(err.stack)
                return Promise.reject(err)
            })
    }
}

export function hookNewRelic(url, func) {
    return new Promise((resolve, reject) => {
        if (global.newrelic && global.newrelic.startWebTransaction) {
            global.newrelic.startWebTransaction(url, () => {
                const p = func()
                if (p && p.then) {
                    p.then(() => {
                        global.newrelic.getTransaction().end()
                        resolve()
                    }).catch((err) => {
                        global.newrelic.noticeError(err)
                        global.newrelic.getTransaction().end()
                        reject(err)
                    })
                } else {
                    global.newrelic.getTransaction().end()
                    resolve()
                }
            })
        } else {
            const p = func()
            if (p && p.then) {
                p.then(() => {
                    resolve()
                }).catch((err) => reject(err))
            } else {
                resolve()
            }
        }
    })
}

export function attachMethods(msg, bot) {
    msg.sendPrivateMessage = createSendPrivateMsgFunction(msg, bot)
    msg.sendChatMessage = createSendChatMsgFunction(msg, bot)
    msg.sendMessage = createSendMsgToFunction(bot)
    msg.sendPhoto = createSendPhotoFunction(bot)
    msg.editMessageText = createEditMessageTextFunction(bot)
}

export function roundTo(n, t) {
    t = t || 0
    return Math.round(n * (Math.pow(10, t))) / Math.pow(10, t)
}

export function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function isValidInt(num) {
    const n = Number(num)
    const int = parseInt(num, 10)
    return !isNaN(int) && (typeof int === 'number') && int === n
}

export function isValidFloat(num) {
    const n = toNumber(num)
    const float = parseFloat(num)
    return !isNaN(float) && (typeof float === 'number' || float instanceof Number) && float === n
}

export function parseFloat(num) {
    if (typeof num === 'string') {
        // convert , to .
        return parseFloat(num.replace(/\,/g, '.'))
    } else if (typeof num === 'number') {
        return parseFloat(num)
    } else {
        return NaN
    }
}

export function toNumber(num) {
    if (typeof num === 'string') {
        // convert , to .
        return Number(num.replace(/\,/g, '.'))
    } else if (typeof num === 'number') {
        return Number(num)
    } else {
        return NaN
    }
}

/*
    Wad's 16 color palette
    http://alumni.media.mit.edu/~wad/color/numbers.html
*/
export class RGB {
    public r: number
    public g: number
    public b: number

    constructor(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }
}

const wadsPalette = [
    new RGB(0, 0, 0), // Black
    new RGB(87, 87, 87), // Dk. Gray
    new RGB(173, 35, 35), // Red
    new RGB(42, 75, 215), // Blue
    new RGB(29, 105, 20), // Green
    new RGB(129, 74, 25), // Brown
    new RGB(129, 38, 192), // Purple
    new RGB(160, 160, 160), // Lt. Gray
    new RGB(129, 197, 122), // Lt. Green
    new RGB(157, 175, 255), // Lt. Blue
    new RGB(41, 208, 208), // Cyan
    new RGB(255, 146, 51), // Orange
    new RGB(255, 238, 51), // Yellow
    new RGB(233, 222, 187), // Tan
    new RGB(255, 205, 243), // Pink
    // [255, 255, 255] // White
]

export function getColorSet(): RGB[]  {
    return [].concat(wadsPalette) // return a copy
}

export function hashSha256(data) {
    const hash = crypto.createHash('sha256')
    hash.update('' + data) // tostring
    return hash.digest('hex')
}

export function encrypt(data) {
    const cipher = crypto.createCipher('aes192', _secret_)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
}

export function decrypt(data) {
    const cipher = crypto.createDecipher('aes192', _secret_)
    let encrypted = cipher.update(data, 'hex', 'utf8')
    encrypted += cipher.final('utf8')
    return encrypted
}

export function groupDrinksByUser(drinks) {
    const drinksByUser = {}
    for (const drink of drinks) {
        if (!drinksByUser[drink.userid]) {
            drinksByUser[drink.userid] = {
                userid: drink.userid,
                nick: decrypt(drink.nick),
                weight: drink.weight,
                gender: drink.gender,
                height: drink.height,
                drinks: [],
            }
        }
        drinksByUser[drink.userid].drinks.push(drink)
    }
    return drinksByUser
}

/*
    Placeholder string format
    https://stackoverflow.com/questions/18405736/is-there-a-c-sharp-string-format-equivalent-in-javascript
*/
String.prototype.format = function(placeholders: object) {
    let s = this
    for (const propertyName in placeholders) {
        const re = new RegExp('{' + propertyName + '}', 'gm')
        s = s.replace(re, placeholders[propertyName])
    }
    return s
}

String.prototype.unformat = function() {
    return this.replace(/{.+}/g, '')
}
