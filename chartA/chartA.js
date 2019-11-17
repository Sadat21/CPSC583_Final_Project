var margin = {top: 0, right: 0, bottom: 0, left: 0},
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

    d3.csv("../dataset.csv", function (data){

        // These variables are used to get the label positioning correct, we must pass around data objects of  the
        // position of the bars.
        var globalArr = [];
        var i = -1;
        var holder = true;

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
            .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

        // Z scale for colors
        var z = d3.scaleOrdinal()
            .domain(data.columns.slice(4,7))
            .range(["#c52028", "#a000a6", "#0b0488"]);

        // imagine your doing a part of a donut plot, arc object
        var arc = d3.arc()
            .innerRadius(function(d) {
                return y(d[0]*10)})
            .outerRadius(function(d)
            {
                return y(d[1]*10);
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
        var legend = g => g.append("g")
            .selectAll("g")
            .data(data.columns.slice(4,7).reverse())
            .enter().append("g")
            // try messing with translate to move it out so we can actually do stuff
            .attr("transform", (d, i) => `translate(-170,${(i - (data.columns.slice(4,7).length - 1) / 2) * 20 })`)
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


        // Add bars
        svg.append("g")
            .selectAll("g")
            .data(d3.stack()
               .keys(data.columns.slice(4,7))(data))
            .enter().append("g")
            .attr("fill", function(d){
                return z(d.key);
            })
            .selectAll("path")
            .data(function(d)
            {
                if (d.key === "Under-five mortality rate (probability of dying by age 5 per 1000 live births)")
                    {globalArr.push(d);}
                return d;
            })
            .enter()
            .append("path")
            .attr("d", arc);

        // Add the labels
        svg.append("g")
         .selectAll("g")
         .data(data)
         .enter()
         .append("g")
         .attr("text-anchor", function(d) { return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
         .attr("transform", function(d) {

             if (holder === true) {
                 globalArr = globalArr[0];
                 holder = false;
             }
            i++;
            var current = globalArr[i];
             return "rotate(" + ((x(d.Country) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" +
             ( y(current[1]*10)+10) + ",0)"; })
    .append("text")
         .text(function(d){return(d.Country)})
         .attr("transform", function(d) { return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
         .style("font-size", "10px")
         .style("display","inline")
         .style('fill', 'darkOrange')
         .attr("alignment-baseline", "middle");

        svg.append("g")
            .call(legend);

    });


}