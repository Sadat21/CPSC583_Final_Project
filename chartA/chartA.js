/////////////////////
//  Chart A - CPSC 583 - Sedat Islam & Ali Al-Khaz'Aly
//  Overlapping Circular Barplot
//  This code was adapted from the online D3 tutorials sourced at :
// https://www.d3-graph-gallery.com/circular_barplot.html?fbclid=IwAR1oYWzsSank3S_DRk3jjdPhx4hgD5imgMuvIUV_8t9NszwAOkq7jTLUiis
//////////////////////


// WE COULD JUST STORE ALL THIS COUNTRY STUFF AS JSON AND PARSE THE JSON?

// Create spacing variables
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1500 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom,
    innerRadius = 250,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg = d3.select("#my_dataviz")
    .classed("svg-container", true)
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1500 1500")
    // Class to make it responsive.
    .classed("svg-content-responsive", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");



/**
 * Application Entry Point
 */
window.onload = run();

// main entry point
function run() {

    d3.csv("../dataset.csv", function (data){

        // Setup the size dynamically
        function setup() {

            // dynamically change our SVG container's dimensions with the current browser dimensions
            width = svg.node().getBoundingClientRect().width != undefined ?
                svg.node().getBoundingClientRect().width :
                width;
            height = svg.node().getBoundingClientRect().height != undefined ?
                svg.node().getBoundingClientRect().height :
                height;
        }

        // We will add the abbreviation field for each country
        data.forEach(function(d)
        {
            if(!(d.Country==="")){
                var cntryName = d.Country;
                var abbrev = getiso3(getCountryCode(cntryName));
                d["Abbreviation"] = abbrev; // Add the new abbreviation field
            }
        });

        // X scale
        var x = d3.scaleBand()
            .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
            .align(0)                  // This does nothing ?
            .domain(data.map(function (d) {
                return d.Country;
            })); // The domain of the X axis is the list of states.

        // Y scale
        var y = d3.scaleRadial()
            .range([innerRadius, outerRadius])
            .domain([0, 1000]); // Domain of Y is from 0 to the max seen in the data

        // Z scale for colors
        var z = d3.scaleOrdinal()
            .domain(data.columns.slice(4,7))
            .range(["#e0d200", "#bc5090", "#003f5c"]);

        // Javascript dictionary for mapping region development to a specific color
        var cntryColors = {
            "More dev. region" : "#00c0ff",
            "Less dev. region" : "#c4001a",
        };
        // Arrays for easier access in legends parameter
        var devLevel = [ "Highly Developed Region", "Low Developed Region"];
        var colorArr = [cntryColors["More dev. region"], cntryColors["Less dev. region"]];

        // Gets the y value of the lowest legend so we can position our other legends accordingly
        var lowestLegend;

        // Legend Object
        var legend = g => g.append("g")
            .selectAll("g")
            .data(data.columns.slice(4,7).reverse())
            .enter().append("g")
            .attr("transform", function(d, i)
            {
                if (i === 2)
                {lowestLegend = (i - (data.columns.slice(4,7).length - 1) / 2) * 20;}
                return `translate(${innerWidth/250000 - innerWidth/8},${(i - (data.columns.slice(4,7).length - 1) / 2) * 20 })`;
            } )
            .call(g => g.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", z))
            .call(g => g.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .style("font-size","10px")
                .style('fill', 'darkOrange')
                .text(d => d));

        // Legend for the colors of country names
        var cntryLegends = g => g.append("g")
            .selectAll("g")
            .data(devLevel)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(-75,${lowestLegend + 75 + i * 15})`)
            .call(g => g.append("text")
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .style("font-size","10px")
                .style('fill', (d,i) => colorArr[i])
                .text(d => d));


        //////////////////////////////////////////////
        // Application Method calls
        /////////////////////////////////////////////

        // setup the width and height
        setup();

        // Under 5 mortality rate bars
        svg.append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", z('Under-five mortality rate (probability of dying by age 5 per 1000 live births)'))
            .attr("d", d3.arc()
                // Now draw the bars using the d3 arc object
                .innerRadius(innerRadius)
                .outerRadius(function (d) {
                    return y(d['Under-five mortality rate (probability of dying by age 5 per 1000 live births)']);
                })
                .startAngle(function (d) {
                    return x(d.Country);
                })
                .endAngle(function (d) {
                    return x(d.Country) + x.bandwidth() + 0.001;
                })
                .padAngle(0.01)
                .padRadius(innerRadius))
            .append("svg:title")
            .text(function (d) {return d['Under-five mortality rate (probability of dying by age 5 per 1000 live births)'];});

        // Under 1 infant mortality rate bars
        svg.append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", z('Infant mortality rate (probability of dying between birth and age 1 per 1000 live births)'))
            .attr("d", d3.arc()
            // Now draw the bars using the d3 arc object
                .innerRadius(innerRadius)
                .outerRadius(function (d) {
                    return y(d['Infant mortality rate (probability of dying between birth and age 1 per 1000 live births)']);
                })
                .startAngle(function (d) {
                    return x(d.Country);
                })
                .endAngle(function (d) {
                    return x(d.Country) + x.bandwidth() - 0.008;
                })
                .padAngle(0.01)
                .padRadius(innerRadius))
            .append("svg:title")
            .text(function (d) {return d['Infant mortality rate (probability of dying between birth and age 1 per 1000 live births)'];});

        // Neonatal
        svg.append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", z('Neonatal mortality rate (per 1000 live births)'))
            .attr("d", d3.arc()
            // Now draw the bars using the d3 arc object
                .innerRadius(innerRadius)
                .outerRadius(function (d) {
                    return y(d['Neonatal mortality rate (per 1000 live births)']);
                })
                .startAngle(function (d) {
                    return x(d.Country);
                })
                .endAngle(function (d) {
                    return x(d.Country) + x.bandwidth() - 0.015;
                })
                .padAngle(0.01)
                .padRadius(innerRadius))
            .append("svg:title")
            .text(function (d) {
                return d['Neonatal mortality rate (per 1000 live births)'];
            });

        // Add the country labels
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("text-anchor", function (d) {
                return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
            })
            .attr("transform", function (d) {
                // draw the names using the x scale and circle logic for positioning
                return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" +
                    innerRadius *0.92 + ",0)";
            })
            .append("text")
            .text(function (d) {
                return (d.Abbreviation)
            })
            .attr("transform", function (d) {
                return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";
            })
            .style("font-size", "9px")
            .style('fill', d => cntryColors[d.Development_level])
            .attr("alignment-baseline", "middle");

        // Draw the legends
        svg.append("g")
            .call(legend);

        svg.append("g")
            .call(cntryLegends);

    });

    // Updpate the view based upon the users requests on certain parameters
    var updateView = function(region,least_dev_country,measure1, measure2,measure3,measure4,measure5,measure6)
    {

    }

}