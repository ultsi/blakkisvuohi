'use strict';

let alcomath = {};

const ETANOL_GRAMS_PER_LITRE = 789;
const LIQUID_PERCENT = {mies: 0.58, nainen: 0.49};
const MEAN_BODY_WATER = 0.806;

alcomath.calcAlcoholMilliGrams = function(vol_perc, amount) {
  return Math.round(vol_perc * ETANOL_GRAMS_PER_LITRE * amount * 1000);
};

alcomath.KALJA033 = alcomath.calcAlcoholMilliGrams(0.047, 0.33);
alcomath.NELONEN = alcomath.calcAlcoholMilliGrams(0.055, 0.33);
alcomath.KALJA05 = alcomath.calcAlcoholMilliGrams(0.047, 0.50);
alcomath.SHOTTI40 = alcomath.calcAlcoholMilliGrams(0.4, 0.04);

alcomath.getPermillesFromGrams = function(user, grams) {
  let standard_drinks = grams / 10.6;
  return (MEAN_BODY_WATER * (standard_drinks)) / (LIQUID_PERCENT[user.gender] * user.weight) * 10;
};

alcomath.sumGrams = function(drinks) {
  let milligrams = 0;
  for(var i in drinks) {
    let drink = drinks[i];
    milligrams += drink.alcohol;
  }
  return milligrams / 1000.0;
};

alcomath.getUserBurnRate = function(user) {
  return user.weight / 9.0;
};

alcomath.sumGramsUnBurned = function(user, drinks) {
  let milligrams = 0;
  let now = Date.now();
  let lastTime = null;
  let hourInMillis = 3600 * 1000;
  let userBurnRateMilligrams = alcomath.getUserBurnRate(user) * 1000;
  for(var i in drinks) {
    let drink = drinks[i];
    let drinkTime = Date.parse(drink.created);
    if(lastTime) {
      let diff = drinkTime - lastTime;
      let diffInHours = diff / hourInMillis;
      milligrams -= (userBurnRateMilligrams * diffInHours);
      milligrams = milligrams > 0 ? milligrams : 0;
    }
    milligrams += drink.alcohol;
    lastTime = drinkTime;
  }
  let diff = now - lastTime;
  let diffInHours = diff / hourInMillis;
  milligrams -= userBurnRateMilligrams * diffInHours;
  milligrams = milligrams > 0 ? milligrams : 0;
  return milligrams / 1000.0;
};

alcomath.getPermillesFromDrinks = function(user, drinks) {
  return alcomath.getPermillesFromGrams(user,(alcomath.sumGramsUnBurned(user, drinks)));
};

module.exports = alcomath;
