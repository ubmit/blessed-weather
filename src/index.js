'use strict';

const S = require ('sanctuary');

const {
  MAPBOX_ACCESS_TOKEN: token,
  DARK_SKY_API_SECRET_KEY: secretKey,
} = require ('../keys');

const geocode = require ('./utils/geocode');
const forecast = require ('./utils/forecast');

const arg = S.pipe ([
  S.drop (2),
  S.chain (S.head),
]) (process.argv);

const prop = S.curry2 ((prop, fallback) =>
  S.pipe ([
    S.prop (prop),
    S.fromMaybe (fallback),
  ]));

geocode (token) (arg) (
  S.either
    (console.error)
    (data => {
      const lat = prop ('latitude') (0) (data);
      const lon = prop ('longitude') (0) (data);
      const location = prop ('location') ('Mars') (data);

      console.log (location);

      forecast (secretKey) (lat) (lon) (
        S.either
          (console.error)
          (console.log)
      );
    })
);
