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

let utils = module.exports = {};
let when = require('when');

utils.getDateMinusHours = function(hours) {
    const hourInMillis = 3600*1000;
    const hoursAgo = new Date(Date.now()-hours*hourInMillis);
    return hoursAgo;
};

function createSendPrivateMsgFunction(msg) {
    return function(text) {
        let deferred = when.defer();
        global.bot.sendMessage(msg.from.id, text)
        .then(function () {
            console.log('sent ' + text + ' to ' + msg.from.username);
            deferred.resolve();
        }, function(err) {
            console.error('couldn\'t send private msg! Err: ' + err);
            deferred.reject(err);
        });
        return deferred.promise;
    };
}

function createSendChatMsgFunction(msg) {
    return function(text) {
        let deferred = when.defer();
        global.bot.sendMessage(msg.chat.id, text)
        .then(function () {
            console.log('sent ' + text + ' to chat ' + msg.chat.title);
            deferred.resolve();
        }, function(err) {
            console.error('couldn\'t send chat msg! Err: ' + err + ' trace: ' + err.stack);
            deferred.reject(err);
        });
        return deferred.promise;
    };
}

function createSendMsgToFunction(msg) {
    return function(chatId, text) {
        let deferred = when.defer();
        global.bot.sendMessage(chatId, text)
        .then(function () {
            console.log('sent ' + text + ' to chat ' + chatId);
            deferred.resolve();
        }, function(err) {
            console.error('couldn\'t send chat msg! Err: ' + err);
            deferred.reject(err);
        });
        return deferred.promise;
    };
}

function createUserToStringFunction(msg) {
    return function(){
        return 'user: {id: '+msg.from.id+', name: '+msg.from.first_name + ' ' + msg.from.last_name + ', username: ' + msg.from.username + '}';
    };
}

utils.attachMethods = function attachMethods(msg) {
    msg.sendPrivateMsg = createSendPrivateMsgFunction(msg);
    msg.sendChatMsg = createSendChatMsgFunction(msg);
    msg.sendMsgTo = createSendMsgToFunction(msg);
    msg.userToString = createUserToStringFunction(msg);
};

utils.isValidInt = function(num){
    return !!parseInt(num, 10);
};

utils.isValidFloat = function(num){
    return !!parseFloat(num);
};
