'use strict';

const S = require ('sanctuary');
const $ = require ('sanctuary-def');
const request = require ('request');

const getDarkSkyUrl = S.curry2 ((secretKey, coordinates) => {
  const [latitude, longitude] = coordinates;
  const baseDarkSkyUrl = 'https://api.darksky.net/forecast';
  return `${baseDarkSkyUrl}/${secretKey}/${longitude},${latitude}`;
});

const farenheitToCelsius = temperature =>
  (temperature - 32) * 5 / 9;

const round = number => number.toFixed (2);

const forecast = S.curry4 ((secretKey, lat, lon, callback) => {
  const url = getDarkSkyUrl (secretKey) ([lat, lon]);

  request ({url, json: true}, (err, res) => {
    if (err) {
      callback (S.Left ('Unable to connect to weather service!'));
    } else if (res.body.error) {
      callback (S.Left ('Unable to find the given location!'));
    } else {
      const currentWeather = S.pipe ([
        S.prop ('body'),
        S.get (S.is ($.Object)) ('currently'),
        S.fromMaybe ({temperature: 'X', precipProbability: 'Y'}),
      ]) (res);

      const temperature = S.pipe ([
        S.prop ('temperature'),
        farenheitToCelsius,
        round,
      ]) (currentWeather);

      const precipProbability =
        S.prop ('precipProbability') (currentWeather);

      callback (S.Right (`Currently, the temperature is: ${temperature} degrees Celsius. And there is a ${precipProbability}% of rain`));
    }
  });
});

module.exports = forecast;
