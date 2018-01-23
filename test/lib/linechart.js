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
    linechart.js
    unit tests for linechart.js functions
*/

/* globals describe, it */

'use strict';
const linechart = require('../../app/lib/linechart.js');


const assert = require('assert');

describe('linegraph.js', function() {
    describe('linechart.getLineGraphBuffer()', function() {
        this.slow(200);
        it('should return a png buffer with empty data', function(done) {
            linechart.getLineGraphBuffer([], '')
                .then((buffer) => {
                    assert.notEqual(buffer, undefined);
                    assert.equal(typeof buffer, 'object');
                    assert(buffer instanceof Buffer);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('should return a png buffer with some data and text', function(done) {
            linechart.getLineGraphBuffer([1, 2, 3, 4, 5, 6], 'test text')
                .then((buffer) => {
                    assert.notEqual(buffer, undefined);
                    assert.equal(typeof buffer, 'object');
                    assert(buffer instanceof Buffer);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });
});