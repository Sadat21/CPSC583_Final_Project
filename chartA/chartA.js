var MARGINS = {top: 20, right: 160, bottom: 35, left: 50};



var display;
var width =  1100;
height = 700;

// on startup, begin the javascript
window.onLoad = run();

/* Data in strings like it would be if imported from a csv */

// Function to hold it all
function run() {

    d3.csv("dataset.csv").then(function (data) {

        display = d3.select("#vis");

        // take a subset of the data
        // data = data.slice(5, 15);
        var countryData = [...new Set(data.map(d => d.Country))]

        // create variables
        var colors;
        var xAxisScale;
        var yAxisScale;
        var layers;
        var grouping;
        var groups;

        // entry point and order of actions taken
        setup();
        setupScales();
        setupLayers();
        createBars();
        setupAxes();

        // dynamically sized display
        function setup() {

            // dynamically change our SVG container's dimensions with the current browser dimensions
            width = display.node().getBoundingClientRect().width != undefined ?
                display.node().getBoundingClientRect().width :
                width;
            height = display.node().getBoundingClientRect().height != undefined ?
                display.node().getBoundingClientRect().height :
                height;
        }

        // prepare the scales for the data display, as well as the colors we will be using
        function setupScales() {
            xAxisScale = d3.scaleBand()
                .domain(countryData)
                .range([MARGINS.left, width - MARGINS.left])
                .padding(0.1);


            yAxisScale = d3.scaleLinear()
                .domain([0, 200])
                .range([height - MARGINS.bottom, MARGINS.top]);

            colors = ["b33040", "#d25c4d", "#f2b447"];
        }

        // create the axes, ticks, labels,
        function setupAxes(xLabel, yLabel) {
            xLabel = xLabel === undefined ? "Country" : xLabel;
            yLabel = yLabel === undefined ? "Mortality Rates Annually" : yLabel;

            // call d3's axisBottom for the x-axis
            xAxis = d3.axisBottom(xAxisScale)
                .ticks(10)
                .tickSizeOuter(0)
                .tickSizeInner(0);


            // call d3's axisLeft for the y-axis
            yAxis = d3.axisLeft(yAxisScale)
                .ticks(5)
                .tickSizeOuter(0)
                .tickSizeInner(-this.width + MARGINS.left*2)

            console.log(d3.axisLeft(yAxisScale));



            // call our axes inside "group" (<g></g>) objects inside our SVG container
            display.append("g")
                .attr("transform", `translate(0, ${height - MARGINS.bottom })`)
                .call(xAxis);
            display.append("g")
                .attr("transform", `translate(${MARGINS.left}, 0)`)
                .call(yAxis);

            // add text labels
            display.append("text")
                .attr("x", MARGINS.left)
                .attr("y", (height)/2)
                .attr("transform", `rotate(-90, ${MARGINS.left / 4}, ${height/2})`)
                .style("text-anchor", "middle")
                .text(yLabel);
            display.append("text")
                .attr("x", (width)/2)
                .attr("y", MARGINS.top-5 )
                .attr("text-anchor", "middle")
                .style("text-anchor", "middle")
                .style("font-size", "15px")
                .text(xLabel);
            // label for the legend ("Role 1")
            display.append("text")
                .attr("x", width/1.2)
                .attr("y", MARGINS.top )
                .attr("text-anchor", "middle")
                .style("text-anchor", "middle")
                .style("font-size", "15px")
                .text("Role 1");


        }

        // Prepare the layers for the proper displaying of the bars
        function setupLayers()
        {
            // create layers based upon the 3 mortality rates
            layers = d3.stack()
                .keys(["Neonatal mortality rate (per 1000 live births)",
                    "Infant mortality rate (probability of dying between birth and age 1 per 1000 live births)",
                    "Under-five mortality rate (probability of dying by age 5 per 1000 live births)"])
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            // create a grouping out of the layers
            grouping = layers(data);

            // Create groups for each series, rects for each segment
            groups = display.selectAll("g.mortality")
                .data(grouping)
                .enter()
                .append("g")
                .attr("class", "mortality")
                .style("fill", function (d, i) {
                    return colors[i];
                });
        }

        // create the bars
        function createBars() {

            var rect = groups.selectAll()
                .data(function(d) {return d;})
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return xAxisScale(d.data.Country)+25; })
                .attr("y", function(d) {

                    return yAxisScale(d[1]);   // the height of the previous bar is where this one will begin
                })
                // current y - last y = height
                .attr("height", function(d) { return yAxisScale(d[0])-yAxisScale(d[1])})
                .attr("width", 50)
                .append("svg:title")
                .text(function (d) {return d[1]-d[0];});   // display the size of each specific segment removing d3 scaling
        }


        // Draw legend
        // Some of this was adapted from http://bl.ocks.org/mstanaland/6100713, which was based on d3 version 3,
        // here we are running d3 version 5
        var legend = display.selectAll(".legend")
            .data(colors)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

        // create the colored rectangles we will be using
        legend.append("rect")
            .attr("x", width - 1/3.5*width)
            .attr("y", height/30)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d, i) {
                return colors.slice().reverse()[i];
            });
        // prepare the text to be displayed for each bar and do it relative to the ordering of the bars using a switch
        legend.append("text")
            .attr("x", width - 1/3.7*width)
            .attr("y", height/20)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-size","9.5px")
            .text(function (d, i) {
                switch (i) {
                    case 0:
                        return "Under-five mortality rate (per 1000 live births)";
                    case 1:
                        return "Infant mortality rate (Up to age 1, per 1000 live births)";
                    case 2:
                        return "Neonatal mortality rate (per 1000 live births)";
                }
            });
    });
}
