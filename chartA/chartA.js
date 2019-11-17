var margin = {top: 100, right: 0, bottom: 0, left: 0},
    width = 900 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom,
    innerRadius = 150,
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
            .range([innerRadius, outerRadius])   // Domain will be define later.
            .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

        // Z scale for colors
        var z = d3.scaleOrdinal()
            .domain(data.columns.slice(4,6))
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        // imagine your doing a part of a donut plot, arc object
        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                console.log(d);
                // Multiply by 250 to scale up the bars

                //return y(d['Neonatal mortality rate (per 1000 live births)'] *50);
                
                return y(d[1])
            })
            .startAngle(function (d) {
                return x(d.Country);
            })
            .endAngle(function (d) {
                return x(d.Country) + x.bandwidth();
            })
            .padAngle(0.01)
            .padRadius(innerRadius);
        // Add bars
        svg.append("g")
            .selectAll("g")
            .data(d3.stack()
               .keys(data.columns.slice(4,6))(data))
            .enter().append("g")
            .attr("fill", d=>z(d.key))
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            // .attr("fill", "#69b3a2")
            .attr("d", arc);

        // Add the labels
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("text-anchor", function(d) { return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            // NOTE THE Y VALUE IS ALSO SCALED UP HERE!
            .attr("transform", function(d) { return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['Neonatal mortality rate (per 1000 live births)'] *50)+5) + ",0)"; })
            .append("text")
            .text(function(d){return(d.Country)})
            .attr("transform", function(d) { return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "6px")
            .attr("alignment-baseline", "middle");


    });
}