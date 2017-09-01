'use strict';

const alcomath = require('./alcomath.js');

let alcoconstants = {};
alcoconstants.emoji = {
  beer: '🍺',
  wine: '🍷'
};

alcoconstants.milds = {
  beercan: {
    print: alcoconstants.emoji.beer + ' 33cl 4.7%',
    mg: alcomath.calcAlcoholMilliGrams(0.047, 0.33)
  },
  beer04: {
    print: alcoconstants.emoji.beer + ' 40cl 4.7%',
    mg: alcomath.calcAlcoholMilliGrams(0.047, 0.40)
  },
  beer4: {
    print: alcoconstants.emoji.beer + ' 33cl 5.5%',
    mg: alcomath.calcAlcoholMilliGrams(0.055, 0.33)
  },
  beer05: {
    print: alcoconstants.emoji.beer + ' 50cl 4.7%',
    mg: alcomath.calcAlcoholMilliGrams(0.047, 0.5)
  },
  beerpint: {
    print: alcoconstants.emoji.beer + ' 56.8cl 4.7%',
    mg: alcomath.calcAlcoholMilliGrams(0.047, 0.568)
  },
  lonkero: {
    print: 'Lonkero 33cl 5.3%',
    mg: alcomath.calcAlcoholMilliGrams(0.053, 0.33)
  },
  wine12: {
    print: alcoconstants.emoji.wine + ' 12cl 12%',
    mg: alcomath.calcAlcoholMilliGrams(0.12, 0.12)
  },
  wine16: {
    print: alcoconstants.emoji.wine + ' 16cl 12%',
    mg: alcomath.calcAlcoholMilliGrams(0.12, 0.16)
  }
};

alcoconstants.booze = {
  mild: {
    print: "20% 4cl",
    mg: alcomath.calcAlcoholMilliGrams(0.2, 0.04)
  },
  medium: {
    print: "32% 4cl",
    mg: alcomath.calcAlcoholMilliGrams(0.32, 0.04)
  },
  basic: {
    print: "40% 4cl",
    mg: alcomath.calcAlcoholMilliGrams(0.4, 0.04)
  }
}

module.exports = alcoconstants;
