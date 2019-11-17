var margin = {top: 25, right: 0, bottom: 0, left: 0},
    width = 1500 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom,
    innerRadius = 250,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");


window.onload = run();

function run() {

    d3.csv("../dataset.csv", function (data) {

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
            .domain([0, 500]); // Domain of Y is from 0 to the max seen in the data

        // Inner Y Scale
        var innerYScale = d3.scaleRadial()
            .range([innerRadius, 0])   // Domain will be defined later.
            .domain([0, 100]);

        // Z scale for colors
        var z = d3.scaleOrdinal()
            .domain(data.columns.slice(4, 7))
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // imagine your doing a part of a donut plot, arc object
        var arc = d3.arc()
            .innerRadius(function (d) {
                return y(d[0] * 10)
            })
            .outerRadius(function (d) {
                return y(d[1] * 10);
            })
            .startAngle(function (d) {
                return x(d.data.Country);
            })
            .endAngle(function (d) {
                return x(d.data.Country) + x.bandwidth();
            })
            .padAngle(0.01)
            .padRadius(innerRadius);


        // Legend Object
        // TODO:

        // Add the first series
        svg.append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "green")
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(innerRadius)
                .outerRadius(function (d) {
                    return y(d['Column1']);
                })
                .startAngle(function (d) {
                    return x(d.Country);
                })
                .endAngle(function (d) {
                    return x(d.Country) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius));

        // Add the labels
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("text-anchor", function (d) {
                return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
            })
            .attr("transform", function (d) {
                return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" +
                    ((y(d["Column1"])) + 10) + ",0)";
            })
            .append("text")
            .text(function (d) {
                return (d.Country)
            })
            .attr("transform", function (d) {
                return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";
            })
            .style("font-size", "9px")
            .attr("alignment-baseline", "middle");

        // Add the second series
        svg.append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "red")
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(function (d) {
                    return innerYScale(0)
                })
                .outerRadius(function (d) {
                    return innerYScale(d['Column2']);
                })
                .startAngle(function (d) {
                    return x(d.Country);
                })
                .endAngle(function (d) {
                    return x(d.Country) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius));

    });


}