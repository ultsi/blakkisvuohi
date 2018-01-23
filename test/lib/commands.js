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
    commands.js
    unit tests for commands.js functions
*/

/* globals describe, it, beforeEach */

'use strict';

const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const mocked = blakkistest.mockMsgAndBot();
const Commands = require('../../app/lib/commands.js');
require('../../app/commands/help.js');
require('../../app/commands/komennot.js');
require('../../app/commands/start.js');
const strings = require('../../app/strings.js');
const settings = require('../../app/settings.js');


describe('commands.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);
    describe('Commands.register()', function() {
        it('should register a command that can be called', function(done) {
            let msg = Object.assign(mocked.msg); // copy
            Commands.register('/test', 'help', Commands.SCOPE_ALL, Commands.PRIVILEGE_ALL, Commands.TYPE_SINGLE, (context) => {
                return context.privateReply('test');
            });
            Commands.call('/test', msg, ['/test'])
                .then(() => {
                    assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                    assert.equal(mocked.internals.sentText, 'test');
                    done();
                }).catch((err) => done(err));
        });

        it('should register a command that can be called by a valid user', function(done) {
            let msg = Object.assign(mocked.msg); // copy
            msg.from.id = blakkistest.realIds[0];
            Commands.register('/testusercommand', 'help', Commands.SCOPE_ALL, Commands.PRIVILEGE_USER, Commands.TYPE_SINGLE, () => {
                done();
                return Promise.resolve();
            });
            Commands.call('/testusercommand', msg, ['/testusercommand'])
                .catch((err) => done(err));
        });
    });

    describe('Commands.call()', function() {
        it('should send help string msg privately with /start', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/start', mocked.msg, ['/start'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.privateId);
                assert.equal(mocked.internals.sentText, strings.commands.blakkis.help_text);
                done();
            }).catch((err) => done(err));
        });

        it('should send cmds string msg privately with /komennot', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/komennot', mocked.msg, ['/komennot'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.privateId);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.cmd_list.unformat()), -1);
                done();
            }).catch((err) => done(err));
        });

        it('should send help string and cmds string msg privately with /help', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.call('/help', mocked.msg, ['/help'])
            .then(() => {
                assert.equal(mocked.internals.sentChatId, mocked.privateId);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.cmd_list.unformat()), -1);
                assert.notEqual(mocked.internals.sentText.indexOf(strings.commands.blakkis.help_text.unformat()), -1);
                done();
            }).catch((err) => done(err));
        });

        it('a user command should not be able to be called by a non-user and a user404 string should be sent', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = 0; // non user id
            Commands.register('/testusercommand2', 'help', Commands.SCOPE_ALL, Commands.PRIVILEGE_USER, Commands.TYPE_SINGLE, () => {
                done(new Error('non user used a user command'));
                return Promise.resolve();
            });
            Commands.call('/testusercommand2', mocked.msg, ['/testusercommand2'])
                .then(() => {
                    assert.equal(mocked.internals.sentText, strings.commands.blakkis.user404);
                    done();
                }).catch((err) => done(err));
        });

        it('a private command should not be able to be called in a chat and a private msg should be sent', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            mocked.msg.chat.type = 'chat';
            Commands.register('/testusercommand2', 'help', Commands.SCOPE_PRIVATE, Commands.PRIVILEGE_USER, Commands.TYPE_SINGLE, () => {
                done(new Error('private command /testusercommand2 used in chat'));
                return Promise.resolve();
            });
            Commands.call('/testusercommand2', mocked.msg, ['/testusercommand2'])
                .then(() => {
                    assert.equal(mocked.internals.sentText, strings.commands.blakkis.use_only_in_private);
                    done();
                }).catch((err) => done(err));
        });

        it('a chat command should not be able to be called in private and a private msg should be sent', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.from.id = blakkistest.realIds[0];
            mocked.msg.chat.type = 'private';
            Commands.register('/testusercommand3', 'help', Commands.SCOPE_CHAT, Commands.PRIVILEGE_USER, Commands.TYPE_SINGLE, () => {
                done(new Error('chat command /testusercommand2 used in chat'));
                return Promise.resolve();
            });
            Commands.call('/testusercommand3', mocked.msg, ['/testusercommand3'])
                .then(() => {
                    assert.equal(mocked.internals.sentText, strings.commands.blakkis.use_only_in_chat);
                    done();
                }).catch((err) => done(err));
        });

        it('an admin command should not be able to called by a non-admin and a msg is sent to the initiating user', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.chat.type = 'private';
            Commands.register('/admin_command', 'help', Commands.SCOPE_ALL, Commands.PRIVILEGE_ADMIN, Commands.TYPE_SINGLE, () => {throw  new Error('You shouldn\'t see this error')});
            Commands.call('/admin_command', mocked.msg, ['/admin_command'])
                .then(() => {
                    assert.equal(mocked.internals.sentChatId, mocked.privateId);
                    assert.equal(mocked.internals.sentText, strings.commands.blakkis.unauthorized);
                    done();
                })
                .catch((err) => done(err));
        });

        it('an admin command should be able to called by an admin', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            mocked.msg.chat.type = 'private';
            mocked.msg.from.id = settings.admin_id;
            Commands.register('/admin_command', 'help', Commands.SCOPE_ALL, Commands.PRIVILEGE_ADMIN, Commands.TYPE_SINGLE, () => done());
            Commands.call('/admin_command', mocked.msg, ['/admin_command'])
                .catch((err) => done(err));
        });

        it('should send general error if command itself is erroneous', function(done) {
            const mocked = blakkistest.mockMsgAndBot();
            Commands.register('/testfail', '/testfail',  Commands.SCOPE_ALL, Commands.PRIVILEGE_ALL, Commands.TYPE_SINGLE, () => {throw new Error('You should see this error from /testfail');});
            Commands.call('/testfail', mocked.msg, ['/testfail'])
                .then(() => {
                    assert.equal(mocked.internals.sentText, strings.commands.blakkis.error);
                    assert.equal(mocked.internals.sentChatId, mocked.msg.from.id);
                    done();
                })
                .catch((err) => done(err));
        });
    });
});