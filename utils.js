'use strict';

let utils = {};

utils.isValidNumber = function(num){
  return parseInt(num, 10) !== 'NaN';
};

module.exports = utils;
