/**
* Parses xvideos stars by category into json
*/

var fs = require('fs');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;
var convert = require('../data_raw/convert_country_code_2_3.json');

const https = require('https')
const options = {
  hostname: 'restcountries.eu',
  method: 'GET'
}

var webpage = fs.readFileSync(path.resolve(__dirname, '../data_raw/countries.html'), 'utf8')

const regex = /flag-(\w+)"><\/span> (.+?)<\/b><span class="navbadge default">((\d+|\d{1,3}(,\d{3})*)(\.\d+)?)</g;
const regex_d = /flag-(\w+)"><\/span> (.+?)<\/b><span class="navbadge default">(.+?)</g;
const found = webpage.match(regex);

let num_finished = 0;
let total_countries = 0;
let obj = {};
for (let res of found) {
  let stats = Array.from(res.matchAll(regex_d));
  let country_code = stats[0][1];

  // These are usually larger regions
  if (country_code == 'none') {
    continue;
  }

  // This is a valid country
  total_countries++;

  // Set #stars stats
  obj[country_code] = {
    name: stats[0][2],
    num_stars: stats[0][3]
  };

  // Get the population of country
  obj[country_code].data = '';
  options.path = `/rest/v2/alpha/${country_code}`;

  const req = https.request(options, res => {
    res.on('data', d => {
      obj[country_code].data += d;
    });

    res.on('end', function() {
      var decoder = new StringDecoder('utf8');
      var result = JSON.parse(decoder.write(obj[country_code].data));
      obj[country_code].data = result;
      num_finished++;

      if (num_finished >= total_countries) {
        let data = JSON.stringify(obj);
        fs.writeFileSync('./data_processed/countries_data.json', data);
      }
    });
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}

for (let country in obj) {
  let country_code = convert[country.toUpperCase()];
  obj[country_code] = obj[country];
}

console.log(obj);
console.log('length', found.length);