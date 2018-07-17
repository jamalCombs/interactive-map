// Debugging 
var print = function (arg) {
    return console.log(arg)
}

// Define the visualization dimensions 
// This is also known as the canvas
var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Set up canvas and bar sizes for bar chart
var canvasWidth = 600,
    canvasHeight = 500,
    otherMargins = canvasWidth * 0.1,
    leftMargin = canvasWidth * 0.25,
    maxBarWidth = canvasHeight - -otherMargins - leftMargin
maxChartHeight = canvasHeight - (otherMargins * 2);

// Set up linear scale for data to fit on chart area 
var xScale = d3.scale.linear()
    .range([0, maxBarWidth]);

// Set up ordinal scale for x variables
var yScale = d3.scale.ordinal();

// Add canvas to HTML
var chart = d3.select("#chart-container")
    .append("svg")
    .attr("width", canvasWidth)
    .attr("height", canvasHeight);

// Set up x axis                            
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(5);

// Set up y axis
var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0);

// Create the SVG container for the map 
var svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Add a translation and transform group within the main SVG container
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        "," + margin.top + ")");

// Track which US state is currently zoomed
var active = d3.select(null);

// Define the properties of the map projection
var projection = d3.geo.albers()
    .rotate([96, 0])
    .center([-.6, 38.7])
    .parallels([29.5, 45.5])
    .scale(1070)
    .translate([width / 2, height / 2])
    .precision(.1);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 5])
    .on("zoom", function () {
        g.attr("transform", "translate(" + d3.event.translate.join(",") + ")")
        g.selectAll("path")
            .attr("d", path.projection(projection));
    })
svg.call(zoom);

// Define a function that returns the SVG
// path based on the projection (lat and long coordinates)
var path = d3.geo.path()
    .projection(projection);

// Used for linked hovering
var activeDistrict;

var inputValue = null;

var slider = d3.select("td")
    .append("td")
    .append("input")
    .datum({})
    .attr("type", "range")
    .attr("value", zoom.scaleExtent()[0])
    .attr("min", zoom.scaleExtent()[0])
    .attr("max", zoom.scaleExtent()[1])
    .attr("step", zoom.scaleExtent()[1] - zoom.scaleExtent[0] / 100)
    .attr("class", "slider")
    .on("input", slided);

// Retrieve the GeoJSON information for the US
d3.json("data/us-states.json", function (json) {

    // if (error) throw error;

    globalJSON = json;

    // Draw the map within the SVG container using a path
    g.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("id", function (d) {
            return d.properties.abbreviation;
        })
        .attr("d", path)
        .attr("fill", "#cccccc")
        .attr("stroke", "#ffffff")
        .on("click", clicked);

    g.selectAll("text")
        .data(json.features)
        .enter()
        .append("text")
        .attr("font-size", "10px")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("dx", function (d) {
            return d.properties.dx || "0";
        })
        .attr("dy", function (d) {
            return d.properties.dy || "0.35em";
        })
        .attr("fill", "white")
        .text(function (d) {
            return d.properties.abbreviation;
        });

    // Create a scale for the radii
    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    // Load CSV data and get the lat and long coords
    csvData = d3.csv("data/projects.csv", function (data) {

        // if (error) throw error;

        filteredData = data.filter(function (d) {
            d.lat = +d.lat;
            d.long = +d.long;

            // Create a list object to store lat and long
            return d.position = projection([d.long, d.lat]);
        });

        // Get variable names of data in csv
        var keys = d3.keys(data[0]);
        var namesTitle = keys[0];
        var valuesTitle = keys[3];

        // Access the properties of each object with the variable name through its key
        var values = function (d) {
            return +d[valuesTitle];
        };
        var names = function (d) {
            return d[namesTitle];
        }

        data.sort(function (a, b) {
            return b.size - a.size;
        })

        // Find highest value
        var maxValue = d3.max(data, values);

        //  Set y domain by mapping an array of the variables along x axis
        yScale.domain(data.map(names));

        // Set x domain with max value and use .nice() to ensure the y axis is labelled above the max y value
        xScale.domain([0, maxValue])
            .nice();

        // Set bar width with rangeBands ([x axis width], gap between bars, gap before and after bars) as a proportion of bar width  
        yScale.rangeBands([0, maxChartHeight], 0.1, 0.25);

        // Set up rectangle elements with attributes based on data
        var rects = chart.selectAll("rect")
            .data(data)
            .enter()
            .append("rect");

        // Set up attributes of svg rectangle elements based on attributes
        var rectAttributes = rects
            .attr("x", leftMargin)
            .attr("y", function (d) {
                return yScale(d[namesTitle]) + otherMargins;
            })
            .attr("width", function (d) {
                return xScale(d[valuesTitle])
            })
            .attr("height", yScale.rangeBand())
            .attr("fill", "#A9A9A9");

        // Append x axis
        chart.append("g")
            .attr("transform", "translate(" + leftMargin + ", " + (maxChartHeight + otherMargins) + ")")
            .attr("text-anchor", "middle")
            .attr("font-family", "Ropa Sans")
            .attr("font-size", "10px")
            .style("stroke", "#606060")
            .style("fill", "none")
            .style("stroke-width", 1)
            .style("shape-rendering", "crispEdges")
            .call(xAxis)
            .selectAll("text")
            .attr("stroke", "none")
            .attr("fill", "#606060");

        // X axis title        
        chart.append("text")
            .attr("x", (maxBarWidth / 2) + leftMargin)
            .attr("y", canvasHeight - (otherMargins / 3))
            .attr("text-anchor", "middle")
            .attr("font-family", "Ropa Sans")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#606060")
            .text("square footage");

        // Draw circles on the map for each data point
        var circles = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return d.position[0];
            })
            .attr("cy", function (d) {
                return d.position[1];
            })
            .attr("r", function (d) {
                return radius(d.size);
            })
            // .attr("fill", typologyMatch)
            .attr("fill", "#FF3333")
            .attr("fill-opacity", ".5")
            // .on("click", tooltip.show)
            .on("mouseover", function (d, i) {
				
				print("mousing over")

                activeDistrict = d.name;

                var xPosition = parseFloat(d3.selectAll("rect")
                    .attr("width")) + leftMargin + 6;
                var yPosition = parseFloat(d3.selectAll("rect")
                    .attr("y")) + (parseFloat(d3.select("rect")
                    .attr("height")) / 2);

                chart.append("text")
                    .attr("id", "tooltip")
                    .attr("x", xPosition)
                    .attr("y", yPosition)
                    .attr("dy", "-50px")
                    .attr("text-anchor", "start")
                    .attr("font-family", "Ropa Sans")
                    .attr("font-size", "15px")
                    .attr("font-weight", "bold")
                    .attr("fill", "#C0C0C0")
                    .text(d.name)


                d3.selectAll("rect")
                    .classed("bar", function (d) {
                        if (d.name === activeDistrict) return true;
                        else return false;
                    })
            })

            // Transition out of tooltip
            .on("mouseout", function (d) {
                d3.select("rect")
                    .transition()
                    .duration(250)
                    .attr("fill", "#A9A9A9");
                d3.select("#tooltip")
                    .remove();
            });

        var dropdown = d3.select("#dropdown");

        // Populate dropdown menu
        d3.select("#dropdown")
            .selectAll("option")
            .on("change", updateCircles)
            .data(d3.set(data.map(function (d) {
                    return d.typology;
                }))
                .values())
            .enter()
            .append("option")
            .attr("value", function (option) {
                // console.log(option.typology)
                return option;
            })
            .text(function (option) {
                return option;
            })
        
        // Circle for callouts
        var updateCircles = function () {
            var selectValue = d3.select("select")
                .property("value");
            var selectedData = data[selectValue];

            console.log(selectedData)

            svg.selectAll("circle")
                .data(selectedData)
                .transition()
                .duration(1000)
                .attr("fill", "#686868");
        }

        print(data)

        var callout = d3.select("svg#project-callouts")
            .selectAll("circle")
			.on("mouseover", function () {
				d3.select(this)
					.attr("r", 40)
					.attr("fill", "#909090")
					
			})
			.on("mouseout", function() {
				d3.select(this)
					.attr("r", 20)
					.attr("fill", "#CCCCCC")
			})
		
		print(callout)

    });

    // Create a tooltip with HTML 
    var tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function (d) {
            return "<div class='d3-tip-container'><div><img id='project-image' src='" + d.images + "'/>" +
                "<span id='name-info'>" + d.name + "</span>" +
                "<div><span>" + d.address + "</span></div>" +
                "<div><span>" + d.typology + "</span></div>" +
                "<div><span>" + d.size + ' Square Feet' + "</span></div>";
        });

    g.call(tooltip);
})

// Click event handler
var clicked = function (d) {

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    // If clicked on state is already active,
    // reset the map to its initial condition.
    if (active.node() === this) return reset();

    // Otherwise, remove the highlighting from
    // the currently active state.
    active.attr("fill", "#cccccc");

    // And add highlighting to the newly
    // active state.
    active = d3.select(this)
        .attr("fill", "#909090");

    // Calculate the bounds for the map that
    // will contain the newly active state.
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    // Transition to the newly active state
    // by translation and scaling.
    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    // To keep the circles from changing
    // size, also transition their radii.
    g.selectAll("circle")
        .transition()
        .duration(750)
        .attr("r", function (d) {
            return (radius(d.size)) / scale;
        });
};

// Reset to initial condition.
var reset = function () {

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    // Remove highlighting from active state
    // and note that no state is now active.
    active.attr("fill", "#cccccc");
    active = d3.select(null);

    // Remove the translation and scale
    // transform with a transition.
    g.transition()
        .duration(750)
        .style("stroke-width", "1px")
        .attr("transform", "");

    // Also keep the circles the same
    // size by transitioning their
    // radii at the same time.
    g.selectAll("circle")
        .transition()
        .duration(750)
        .attr("r", function (d) {
            return (radius(d.size));
        });
};

// Check if table is click
// Loop through json data to match td entry
// and pass json element that matches td data to click 
var tableRowClicked = function (x) {
    globalJSON.features.forEach(function (d) {
        if (d.geometry.coordinates === d.position[0] && d.position[1]) {
            var name = d;
            click(d);
        };
    })
}

var zoomed = function () {
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    slider.property("value", d3.event.scale);
}

var slided = function (d) {
    zoom.scale(d3.select(this)
            .property("value"))
        .event(svg);
}