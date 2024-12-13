// add your JavaScript/D3 to this file


// Load the data
d3.csv("data_d3.csv").then(function(data) {
    const audData = data.map(d => ({
        HIGH_BP: d.HIGH_BP,
        ALC_DIS: d.ALC_DIS,
        DRUG_DIS: d.DRUG_DIS,
        ALC_NUM_CATE: d.ALC_NUM_CATE
    }));

    // Variables to store selected filters
    let selectedDrinkingLevel = "Low";
    let filterAUD = false; // Default: include all individuals

    // Add headings to divide the page
    d3.select("#plot1").insert("h2", ":first-child").text("Component 1: Drinking Levels → AUD Distribution");
    d3.select("#plot2").insert("h2", ":first-child").text("Component 2: AUD → Drinking Level Distribution");

    // Create controls for Component 1
    const controls1 = d3.select("#plot1").append("div").attr("class", "controls");

    // Radio buttons for drinking levels
    const drinkingLevels = ["Low", "Moderate", "High"];
    controls1.selectAll("div.radio-group")
        .data(drinkingLevels)
        .enter()
        .append("div")
        .attr("class", "radio-group")
        .style("margin-bottom", "10px")
        .append("label")
        .style("margin-right", "10px")
        .text(d => d)
        .append("input")
        .attr("type", "radio")
        .attr("name", "drinkingLevel")
        .attr("value", d => d)
        .property("checked", d => d === selectedDrinkingLevel)
        .on("change", function(event) {
            selectedDrinkingLevel = this.value;
            updatePlot1();
        });

    // Create controls for Component 2
    const controls2 = d3.select("#plot2").append("div").attr("class", "controls");

    // Checkbox for AUD filter
    controls2.append("div")
        .style("margin-top", "10px")
        .append("label")
        .style("margin-right", "10px")
        .text("With AUD")
        .append("input")
        .attr("type", "checkbox")
        .on("change", function() {
            filterAUD = this.checked;
            updatePlot2();
        });

    // Plot 1: Drinking Levels -> AUD Distribution
    const svg1 = d3.select("#plot1").append("svg")
        .attr("width", 600)
        .attr("height", 400);

    const color1 = d3.scaleOrdinal().domain(["Yes", "No"]).range(["#66c2a5", "#fc8d62"]);
    const pie1 = d3.pie().value(d => d.value);
    const arc1 = d3.arc().innerRadius(0).outerRadius(150);

    const g1 = svg1.append("g")
        .attr("transform", `translate(300,200)`);

    function updatePlot1() {
        let filtered = audData.filter(d => d.ALC_NUM_CATE === selectedDrinkingLevel);
        const summary = d3.rollup(filtered, v => v.length, d => d.ALC_DIS);
        const chartData = Array.from(summary, ([key, value]) => ({ ALC_DIS: key, value }));

        const paths = g1.selectAll("path").data(pie1(chartData));

        paths.enter()
            .append("path")
            .merge(paths)
            .transition().duration(750)
            .attr("d", arc1)
            .attr("fill", d => color1(d.data.ALC_DIS));

        paths.exit()
            .transition().duration(750)
            .attr("opacity", 0)
            .remove();

        // Update legend
        updateLegend(svg1, color1, ["Yes", "No"]);
    }
    updatePlot1(); // Initial plot

    // Plot 2: AUD -> Drinking Level Distribution
    const svg2 = d3.select("#plot2").append("svg")
        .attr("width", 600)
        .attr("height", 400);

    const color2 = d3.scaleOrdinal().domain(["Low", "Moderate", "High"]).range(["#66c2a5", "#fc8d62", "#8da0cb"]);
    const pie2 = d3.pie().value(d => d.value);
    const arc2 = d3.arc().innerRadius(0).outerRadius(150);

    const g2 = svg2.append("g")
        .attr("transform", `translate(300,200)`);

    function updatePlot2() {
        let filtered = filterAUD
            ? audData.filter(d => d.ALC_DIS === "Yes")
            : audData.filter(d => d.ALC_DIS === "No");

        const summary = d3.rollup(filtered, v => v.length, d => d.ALC_NUM_CATE);
        const chartData = Array.from(summary, ([key, value]) => ({ ALC_NUM_CATE: key, value }));

        const paths = g2.selectAll("path").data(pie2(chartData));

        paths.enter()
            .append("path")
            .merge(paths)
            .transition().duration(750)
            .attr("d", arc2)
            .attr("fill", d => color2(d.data.ALC_NUM_CATE));

        paths.exit()
            .transition().duration(750)
            .attr("opacity", 0)
            .remove();

        // Update legend
        updateLegend(svg2, color2, ["Low", "Moderate", "High"]);
    }
    updatePlot2(); // Initial plot

    // Function to update legend
    function updateLegend(svg, color, labels) {
        const legend = svg.selectAll(".legend").data(labels);

        const legendGroup = legend.enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(450,${i * 20 + 20})`);

        legendGroup.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => color(d));

        legendGroup.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text(d => d);

        legend.exit().remove();
    }
});

