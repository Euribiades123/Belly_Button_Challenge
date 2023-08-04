// 1 - Use the D3 library to read in samples.json 
//from the URL https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json.
// 2 -Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
// 3 - Create a bubble chart that displays each sample.
// 4 - Display the sample metadata, i.e., an individual's demographic information.
// 5 - Display each key-value pair from the metadata JSON object somewhere on the page.
// 6 - Update all the plots when a new sample is selected. Additionally, you are welcome to create any layout that you would like for your dashboard.
// 7 - Deploy your app to a free static page hosting service, such as GitHub Pages. Submit the links to your deployment and your GitHub repo.
// Bonus - Adapt the Gauge Chart from https://plot.ly/javascript/gauge-charts/Links to an external site. to plot the weekly washing frequency of the individual.

// Define the URL for the JSON data
const samplesURL = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Fetch the JSON data
d3.json(samplesURL).then(function(data) {
    // Extract data arrays for the bar chart
    const sample = data.samples[0];
    const sampleValues = sample.sample_values.slice(0, 10).reverse();
    const otuLabels = sample.otu_labels.slice(0, 10).reverse();
    const otuIds = sample.otu_ids.slice(0, 10).map(id => `OTU ${id}`);

    // Create trace for the bar chart
    const traceBar = { 
        x: sampleValues,
        y: otuIds,
        text: otuLabels,
        type: "bar",
        orientation: "h"
    };

    // Create data array for the bar chart
    const barData = [traceBar];

    // Create layout for the bar chart
    const barLayout = {
        title: "Top 10 OTUs",
        xaxis: { title: "Sample Values" },
        yaxis: { title: "OTU IDs" }
    };

    // Plot the bar chart
    Plotly.newPlot("bar", barData, barLayout);

    // Create trace for the bubble chart
    const traceBubble = {
        x: sample.otu_ids,
        y: sample.sample_values,
        text: sample.otu_labels,
        mode: "markers",
        marker: {
            size: sample.sample_values,
            color: sample.otu_ids,
            colorscale: "Earth"
        }
    };

    // Create data array for the bubble chart
    const bubbleData = [traceBubble];

    // Create layout for the bubble chart
    const bubbleLayout = {
        title: "Sample OTU Bubble Chart",
        xaxis: { title: "OTU IDs" },
        yaxis: { title: "Sample Values" }
    };

    // Plot the bubble chart
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // Create trace for the gauge chart
    const traceGauge = {
        domain: {x:[0, 1], y:[0, 1]},
        value: data.metadata.wfreq,
        title: { text: "Belly Button Washing Frequency per Week" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: { range: [null, 9] },
            steps: [
                { range: [0, 1], color: "#f2f2f2f2" },
                { range: [1, 2], color: "#e6e6e6e6" },
                { range: [2, 3], color: "#d9d9d9d9" },
                { range: [3, 4], color: "#cccccccc" },
                { range: [4, 5], color: "#bfbfbfbf" },
                { range: [5, 6], color: "#b3b3b3b3" },
                { range: [6, 7], color: "#a6a6a6a6" },
                { range: [7, 8], color: "#99999999" },
                { range: [8, 9], color: "#8c8c8c" }
            ],
        }      
    };

    // Create data array for the gauge chart
    const gaugeData = [traceGauge];

    // Create layout for the gauge chart
    const gaugeLayout = {
        width: 400,
        height: 400,
        margin: { t: 25, r: 25, l: 25, b: 25 }
    };

    // Plot the gauge chart
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

    // Create the dropdown menu
    const dropdown = d3.select("#selDataset");
    const sampleNames = data.names;

    sampleNames.forEach(sample => {
        dropdown.append("option").text(sample).property("value", sample);
    });

    // Function to update the metadata
    function updateMetadata(selectedSample) {
        const metadata = data.metadata.find(sample => sample.id === parseInt(selectedSample));
        const metadataPanel = d3.select("#sample-metadata");
        
        // Clear the previous metadata
        metadataPanel.html("");

        // Display each key-value pair from the metadata JSON object
        Object.entries(metadata).forEach(([key, value]) => {
            metadataPanel.append("p").text(`${key}: ${value}`);
        });
    }

    // Define the update chart function for both bar, bubble, and gauge charts
    function updateCharts(selectedSample) {
        const selectedSampleData = data.samples.find(sample => sample.id === selectedSample);

        // Update the bar chart
        Plotly.update("bar", {
            x: [selectedSampleData.sample_values.slice(0, 10).reverse()],
            y: [selectedSampleData.otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse()],
            text: [selectedSampleData.otu_labels.slice(0, 10).reverse()]
        });

        // Update the bubble chart
        Plotly.update("bubble", {
            x: [selectedSampleData.otu_ids],
            y: [selectedSampleData.sample_values],
            text: [selectedSampleData.otu_labels],
            marker: {
                size: selectedSampleData.sample_values,
                color: selectedSampleData.otu_ids,
                colorscale: "Earth"
            }
        });

        // Update the gauge chart
        Plotly.update("gauge", {
            value: data.metadata.find(sample=> sample.id ===parseInt(selectedSample)).wfreq
        });

        // Update the metadata panel
        updateMetadata(selectedSample);
    }

    // Handle dropdown change event
    dropdown.on("change", function() {
        const selectedSample = d3.select(this).property("value");
        updateCharts(selectedSample);
    });

    // Initialize the charts and metadata with the first sample data
    updateCharts(sampleNames[0]);
});
