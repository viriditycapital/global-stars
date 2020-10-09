import React from 'react';
import * as d3 from 'd3';
import d3_tip from 'd3-tip';
import * as topojson from "topojson-client";
import countries from './world-countries.json';
import star_data from './countries_data.json';

const PER_CAPITA_AMOUNT = 1e6;

class App extends React.Component {
  componentDidMount() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var svg = d3.select(".world-map")
    .append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + width/11 + "," + 0 + ")");

    var projection = d3.geoMercator()
    .scale(130)
    .translate( [width / 2, height / 1.5]);

    var path = d3.geoPath().projection(projection);

    countries.features = countries.features.filter(d => d.id !== "ATA");

    let max_capita = 0;
    let min_capita = 1000;
    countries.features.forEach((d) => {
      if (star_data[d.id]) {
        d.capita = (
          PER_CAPITA_AMOUNT * parseFloat(star_data[d.id].num_stars.replace(/,/g, ''))/star_data[d.id].data.population
        );

        if (d.capita > max_capita) {
          max_capita = d.capita;
        } else if (d.capita < min_capita) {
          min_capita = d.capita
        }
      }
    });

    let color = d3.scaleThreshold()
    .domain([
      0,
      min_capita,
      1,
      2,
      5,
      10,
      15,
      25,
      50,
      75,
      100,
      150,
      250,
      500,
      max_capita
    ])
    .range([
      "rgb(255, 255, 255)",
      "rgb(255, 246, 230)",
      "rgb(255, 236, 204)",
      "rgb(255, 227, 179)",
      "rgb(255, 218, 153)",
      "rgb(255, 208, 128)",
      "rgb(255, 190, 77)",
      "rgb(255, 180, 51)",
      "rgb(255, 171, 26)",
      "rgb(255, 162, 0)",
      "rgb(230, 145, 0)",
      "rgb(204, 129, 0)",
      "rgb(179, 113, 0)",
      "rgb(153, 97, 0)",
      "rgb(0,0,0)"
    ]);

    /* Initialize tooltip */
    const tip = d3_tip().attr('class', 'd3-tip')
    .html((d) => {
      let num_to_display = d.srcElement.__data__.capita ?
      d.srcElement.__data__.capita.toFixed(2) : 'N/A';
      return `
      <strong>${d.srcElement.__data__.id}:</strong>
      <span style='color:red'>${num_to_display}
      </span>`;
    });

    tip.direction('s')

    /* Invoke the tip in the context of your visualization */
    svg.call(tip);

    svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(countries.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", (d) => {
      if (star_data[d.id]) {
        console.log('capita', d.id, d.capita, color(d.capita))
        return color(d.capita);
      } else {
        // undefined numbers
        console.log('und', color(0))
        return color(0);
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity",0.8)
    // tooltips
    .style("stroke","white")
    .style('stroke-width', 0.3)
    .on('mouseover', function (d) { tip.show(d, this); })
    .on('mouseout', tip.hide);
    svg.append("path")
    .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
    .attr("class", "names")
    .attr("d", path);
  }

  render() {
    return (
      <div className="App">
      <div className='title'>
      Pornstars per capita
      </div>
      <div className='world-map'/>
      </div>
      );
    }
  }

  export default App;
