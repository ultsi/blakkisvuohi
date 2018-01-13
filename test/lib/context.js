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
    context.js
    unit tests for context.js functions
*/

/* globals describe, it */

'use strict';

const assert = require('assert');
const contexts = require('../../app/lib/context.js');

describe('context.js', function() {
    describe('Context()', function() {
        it('should return a context object with default values', function() {
            const context = new contexts.Context({}, {});
            assert(context.cmd);
            assert(context.msg);
            assert.equal(context.phase, 0);
            assert(context.variables);
        });
    });

    describe('context.storeVariable()', function() {
        it('should store a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.variables.test, Math.PI);
        });

        it('should overwrite a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.variables.test, Math.PI);

            context.storeVariable('test', 0);
            assert.equal(context.variables.test, 0);
        });
    });

    describe('context.fetchVariable()', function() {
        it('should fetch a variable', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.fetchVariable('test'), Math.PI);
        });
    });

    describe('context.end()', function() {
        it('should end context and unset variables', function() {
            const context = new contexts.Context({}, {});
            context.storeVariable('test', Math.PI);
            assert.equal(context.fetchVariable('test'), Math.PI);
            assert.equal(context.phase, 0);

            context.end();
            assert(context.fetchVariable('test') === undefined);
            assert(context.phase, -1);
        });
    });
});