
// todo: externalise the constants
const font_size_options = [
	{"8": "8"},
	{"9": "9"},
	{"10": "10"},
	{"10.5": "10.5"},
	{"11": "11"},
	{"12": "12"},
	{"14": "14"},
	{"16": "16"},
	{"18": "18"},
	{"20": "20"},
	{"22": "22"},
	{"24": "24"},
	{"28": "28"},
	{"32": "32"}
];

const chart_colours = ["#3A3E96", "#18B8ED"];

looker.plugins.visualizations.add({

  // Id and Label are legacy properties that no longer have any function besides documenting
  // what the visualization used to have. The properties are now set via the manifest
  // form within the admin/visualizations page of Looker
  id: "investment_trends_bar_prototype",
  label: "Bar Chart",
  options: {
		font_size_x_axis: {
			type: "string",
			label: "Font Size - X Axis",
			values: font_size_options,
			display: "select",
			default: "14"
		},
		font_size_y_axis: {
			type: "string",
			label: "Font Size - Y Axis",
			values: font_size_options,
			display: "select",
			default: "14"
		},
		font_size_chart_label: {
			type: "string",
			label: "Font Size - Chart Label",
			values: font_size_options,
			display: "select",
			default: "14"
		},
		stacked: {
			type: "boolean",
			label: "Stacked",
			values: [
				{"Yes": true},
				{"No": false}
			],
			default: true
		},
		order: {
			type: "boolean",
			label: "Ascending Position Order",
			values: [
				{"Ascending": true},
				{"Descending": false}
			],
			default: true
		}
  },
  // Set up the initial state of the visualization
  create: function(element, config) {

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        .hello-world-vis {
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
				.hello-world-text-large {
          font-size: 22px;
          font-family: Roboto !important;
        }
        .hello-world-text-medium {
          font-size: 16px;
          font-family: Roboto !important;
        }
        .hello-world-text-small {
          font-size: 12px;
          font-family: Roboto !important;
        }
      </style>
    `;


		// Create a container element to var us center the text.
		var container = element.appendChild(document.createElement("div"));
		container.className = "hello-world-vis";

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));
    this._textElement.id = "frequency-bar-chart-root";

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {

		element.innerHTML = "";

		// todo: consider making this a variable and changing based on chart options
		const margin = {
			top: 10,
			bottom: 36,
			left: 75,
			right: 10
		};

		// Clear any errors from previous updates
		this.clearErrors();

		// Throw some errors and exit if the shape of the data isn't what this chart needs
		if (queryResponse.fields.dimensions.length == 0) {
			this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
			return;
		}
		if (queryResponse.fields.measures.length == 0) {
			this.addError({title: "No Measures", message: "This chart requires measures."});
			return;
		}


		// Todo: review range values once we add svg viewbox
		var x = d3.scaleBand()
			.domain(d3.range(data.length))
			.range([margin.left,element.clientWidth - margin.right])
			.paddingInner(0.3)
			// .paddingOuter(0.15)

		var y = d3.scaleLinear()
			.domain([0, 100])
			.range([element.clientHeight - margin.bottom, margin.top]);

		var height = d3.scaleLinear()
			.domain([0, 100])
			.range([0, element.clientHeight - (margin.bottom + margin.top)])


		// /* test output */
		// console.log("test x funciton...(groupX, bufferColX)")
		// for (var i = 0; i < data.length; i ++) {
		// 	console.log(x(i))
		// }
		// console.log("test height/y funciton...")
		// for (var i = 0; i <= 100; i +=10) {
		// 	console.log(height(i));
		// 	console.log(y(i));
		// }
		//
		console.log("KEYS: measure name, pivot names, data")
		console.log(queryResponse.fields.measures[0].name)
		console.log(queryResponse.pivots[0].key)
		console.log(queryResponse.pivots[1].key)
		console.log(data[0][queryResponse.fields.measures[0].name])
		console.log(data[0][queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100)
		console.log(height(data[0][queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100))
		console.log(data[1][queryResponse.fields.measures[0].name])
		console.log(data[1][queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100)
		console.log(height(data[1][queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100))

		// start building the graphs
		const svg = d3.create("svg")
			// TODO add view box to scale it down
				.attr("width", element.clientWidth)
				.attr("height", element.clientHeight)
				.attr("font-family", "Roboto")
				.attr("text-anchor", "end");

		const bar = svg.selectAll("g")
				.data(data)
				.enter().append("g") // replace .join() as per https://stackoverflow.com/questions/55397871/how-to-fix-join-is-not-a-function-when-trying-join-after-selectall
					.attr("transform", function(d,i) {return `translate(${x(i)},0)`})

		// TODO: for loop for data length to stack
		// columns
		bar.append("rect")
			.attr("fill", chart_colours[0])
			.attr("width", x.bandwidth())
			.attr("height", function(d) {return Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100))})
			// top buffer + chart height - bar height = top of bar
			.attr("y", function(d) {return Math.round(y(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100))})

		bar.append("rect")
			.attr("fill", chart_colours[1])
			.attr("width", x.bandwidth())
			.attr("height", function(d) {return Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[1].key].value * 100))})
			// top buffer + chart height - bar height = top of bar
			.attr("y", function(d) {return Math.round(y(d[queryResponse.fields.measures[0].name][queryResponse.pivots[1].key].value * 100)) - Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100))})

		// text
		bar.append("text")
			.attr("fill", "white")
			.attr("y", function(d) {return Math.round(y(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100)) + Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100)/2)})
			.attr("x", x.bandwidth()/2)
			.style("font-style","bold")
			.style("font-family","Roboto")
			.text(function(d) {return Math.round(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100) + "%"})

		bar.append("text")
			.attr("fill", "white")
			.attr("y", function(d) {return Math.round(y(d[queryResponse.fields.measures[0].name][queryResponse.pivots[1].key].value * 100)) - Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[0].key].value * 100)) + Math.round(height(d[queryResponse.fields.measures[0].name][queryResponse.pivots[1].key].value * 100)/2)})
			.attr("x", x.bandwidth()/2)
			.style("font-style","bold")
			.style("font-family","Roboto")
			.text(function(d) {return Math.round(d[queryResponse.fields.measures[0].name][queryResponse.pivots[1].key].value * 100) + "%"})


    // Set the size to the user-selected size
		if (config.font_size == "small") {
			this._textElement.className = "hello-world-text-small";
		} else if (config.font_size == "medium") {
			this._textElement.className = "hello-world-text-medium";
    } else {
      this._textElement.className = "hello-world-text-large";
    }

		element.append(svg.node())
		// element.innerHTML = html
    // We are done rendering! let Looker know.
	doneRendering()
	console.log('doneRendering');
  }
});
