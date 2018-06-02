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
    juoma.js
    unit tests for juoma.js functions
*/

/* globals describe, it, beforeEach */

'use strict';
require('../../app/commands/juoma.js');


const assert = require('assert');
const blakkistest = require('../blakkistest.js');
const Commands = require('../../app/lib/commands.js');
const strings = require('../../app/strings.js');

describe('juoma.js', function() {
    beforeEach(blakkistest.resetDbWithTestUsersAndGroupsAndDrinks);

    it('Calling /juoma and selecting one mild should insert a drink to db', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.milds, mocked.msg, [strings.commands.juoma.milds]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.choose_mild);
                const option = mocked.internals.sentOptions.reply_markup.keyboard[0][0];
                mocked.msg.text = option;
                return Commands.call(option, mocked.msg, [option]);
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf('‰'), -1);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 3); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });

    it('Calling /juoma and selecting one booze should insert a drink to db', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.booze, mocked.msg, [strings.commands.juoma.booze]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.choose_booze);
                const option = mocked.internals.sentOptions.reply_markup.keyboard[0][0];
                mocked.msg.text = option;
                return Commands.call(option, mocked.msg, [option]);
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf('‰'), -1);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 3); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });

    it('Calling /juoma and and inputting own drink should insert a drink to db', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.self_define, mocked.msg, [strings.commands.juoma.self_define]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = '12';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                const cl = '33';
                mocked.msg.text = cl;
                return Commands.call(cl, mocked.msg, [cl]);
            })
            .then(() => {
                assert.notEqual(mocked.internals.sentText.indexOf('‰'), -1);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 3); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });

    it('Calling /juoma and and inputting own drink with invalid vol should error', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.self_define, mocked.msg, [strings.commands.juoma.self_define]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = '-1';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = '101';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = 'a';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });

    it('Calling /juoma and and inputting own drink with invalid cl should error', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.self_define, mocked.msg, [strings.commands.juoma.self_define]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = '1';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                const cl = '-1';
                mocked.msg.text = cl;
                return Commands.call(cl, mocked.msg, [cl]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                const cl = 'a';
                mocked.msg.text = cl;
                return Commands.call(cl, mocked.msg, [cl]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                const cl = '0';
                mocked.msg.text = cl;
                return Commands.call(cl, mocked.msg, [cl]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });

    it('Calling /juoma and and inputting own drink with too much alcohol should error', function(done) {
        const mocked = blakkistest.mockMsgAndBot();
        const user = blakkistest.users[0];
        mocked.msg.from.id = blakkistest.realIds[0];
        mocked.msg.from.username = user.username;

        user.getBooze()
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return Commands.call('/juoma', mocked.msg, ['/juoma']);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.start);
                mocked.msg.text = strings.commands.juoma.milds;
                return Commands.call(strings.commands.juoma.self_define, mocked.msg, [strings.commands.juoma.self_define]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_vol);
                const vol = '80';
                mocked.msg.text = vol;
                return Commands.call(vol, mocked.msg, [vol]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_cl);
                const cl = '100';
                mocked.msg.text = cl;
                return Commands.call(cl, mocked.msg, [cl]);
            })
            .then(() => {
                assert.equal(mocked.internals.sentText, strings.commands.juoma.self_define_error_alcohol_limit);
                return user.getBooze();
            })
            .then((rows) => {
                assert.equal(rows.length, 2); // 2 beers already in
                return done();
            })
            .catch((err) => done(err));
    });
});