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
    unit tests for utils.js functions
*/

/* globals describe, it */

'use strict';

const assert = require('assert');
const utils = require('../../app/lib/utils.js');

describe('utils', function() {
    describe('getDateMinusHours()', function() {
        it('should return current date with hours = 0', function() {
            const now = new Date().getTime();
            const then = utils.getDateMinusHours(0).getTime();
            const diff = now - then;
            assert(diff < 5);
        });

        it('should return date - 36*3600000 with hours = 36', function() {
            const now = new Date().getTime();
            const hourInMillis = 3600 * 1000;
            const hours = 36;
            assert(now - hours * hourInMillis === utils.getDateMinusHours(hours).getTime());
        });
    });

    describe('roundTo()', function() {
        it('should round PI to 3.14159 with n=5', function() {
            assert(utils.roundTo(Math.PI, 5) === 3.14159);
        });

        it('should round PI to 3 with n=0', function() {
            assert(utils.roundTo(Math.PI, 0) === 3);
        });
    });

    describe('isValidInt()', function() {
        it('should return true with 0, -140, 4, 100, \'0\'', function() {
            assert(utils.isValidInt(0));
            assert(utils.isValidInt(-140));
            assert(utils.isValidInt(4));
            assert(utils.isValidInt(100));
            assert(utils.isValidInt('0'));
        });

        it('should return false with \'s\', 0.4, \'3.14\', {}', function() {
            assert(!utils.isValidInt('s'));
            assert(!utils.isValidInt(0.4));
            assert(!utils.isValidInt('3.14'));
            assert(!utils.isValidInt({}));
        });
    });

    describe('isValidFloat()', function() {
        it('should return true with 0, -1210.40, PI, \'0\', \'-3.14\'', function() {
            assert(utils.isValidFloat(0));
            assert(utils.isValidFloat(-1210.40));
            assert(utils.isValidFloat(Math.PI));
            assert(utils.isValidFloat('0'));
            assert(utils.isValidFloat('-3.14'));
        });

        it('should return false with \'s\', \'-\', null, {}', function() {
            assert(!utils.isValidFloat('s'));
            assert(!utils.isValidFloat('-'));
            assert(!utils.isValidFloat(null));
            assert(!utils.isValidFloat({}));
        });
    });

    describe('getColorSet()', function() {
        it('should return 15 colors', function() {
            assert(utils.getColorSet().length === 15);
        });

        it('should return a copy', function() {
            let first = utils.getColorSet();
            let second = utils.getColorSet();
            second.splice(1, 2);
            assert(first.length !== second.length);
        });
    });

    describe('hashSha256()', function() {
        it('should return correct sha256 digest for 1, \'test\', \'reallylongstring\'', function() {
            // sha256 sums from online generator
            const   sha256_1 = '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
                    sha256_test = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
                    sha256_reallylongstring = '116d9490a1b498ab3eebf92e1c6c42569f8c46f1c4dcfac332f1652875b156f2';

            assert(utils.hashSha256(1) === sha256_1);
            assert(utils.hashSha256('test') === sha256_test);
            assert(utils.hashSha256('reallylongstring') === sha256_reallylongstring);
        });
    });

    describe('encrypt()', function() {
        it('should not work with SECRET not set', function() {
            const data = 'test_data';
            process.env.SECRET = undefined;
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils1 = require('../../app/lib/utils.js');
            try {
                utils1.encrypt(data);
                assert(false); // shouldn't execute
            } catch (err) {
                assert(true);
            }
        });

        it('should return different data with different secrets', function() {
            const data = 'test_data';


            process.env.SECRET = 'test1';
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils1 = require('../../app/lib/utils.js');
            const encrypted1 = utils1.encrypt(data);

            process.env.SECRET = 'test2';
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils2 = require('../../app/lib/utils.js');
            const encrypted2 = utils2.encrypt(data);
            assert(encrypted1 !== encrypted2);
        });
    });

    describe('decrypt()', function() {
        it('should not work with SECRET not set', function() {
            const data = 'test_data';
            process.env.SECRET = undefined;
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils1 = require('../../app/lib/utils.js');
            try {
                utils1.decrypt(data);
                assert(false); // shouldn't execute
            } catch (err) {
                assert(true);
            }
        });

        it('shouldn\'t work with any data', function() {
            const data = 'test_data';

            process.env.SECRET = 'test1';
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils1 = require('../../app/lib/utils.js');
            try {
                utils1.decrypt(data);
                assert(false); // shouldn't execute
            } catch (err) {
                assert(true);
            }
        });

        it('should decrypt correctly encrypted data', function() {
            const data = 'test_data';

            process.env.SECRET = 'test1';
            delete require.cache[require.resolve('../../app/lib/utils.js')];

            const utils1 = require('../../app/lib/utils.js');
            const encrypted1 = utils1.encrypt(data);
            assert(utils1.decrypt(encrypted1) === data);
        });
    });
});