'use strict';

const S = require ('sanctuary');
const $ = require ('sanctuary-def');
const request = require ('request');

const getMapboxUrl = S.curry2 ((token, place) => {
  const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  return `${baseUrl}/${encodeURIComponent (place)}.json?access_token=${token}`;
});

const geocode = S.curry3 ((token, place, callback) => {
  if (S.isNothing (place)) {
    return callback (S.Left ('You need to type a place!'));
  }

  const url = getMapboxUrl (token) (S.maybeToNullable (place));

  const features = S.pipe ([
    S.prop ('body'),
    S.parseJson (S.is ($.Object)),
    S.map (S.prop ('features')),
  ]);


  request ({url}, (err, res) => {
    if (err) {
      callback (S.Left ('Unable to connect to geocoding service!'));
    } else if (S.equals (S.Just ([])) (features (res))) {
      callback (S.Left ('Unable to find the given place!'));
    } else {
      const coordinates = S.pipe ([
        S.map (S.head),
        S.join,
        S.map (S.props (['geometry', 'coordinates'])),
      ]) (features (res));

      const latitude = S.chain (S.head) (coordinates);
      const longitude = S.chain (S.last) (coordinates);

      const location = S.pipe ([
        S.chain (S.head),
        S.map (S.prop ('place_name')),
      ]) (features (res));

      callback (S.Right ({latitude, longitude, location}));
    }
  });
});

module.exports = geocode;
