// //execute script when window is loaded
// window.onload = function(){

//     var container = d3.select("body") //get the <body> element from the DOM
//         .append("svg") //put a new svg in the body
//     //SVG dimension variables
//     var w = 900, h = 500;
//     var container = d3.select("body") //get the <body> element from the DOM
//     .append("svg") //put a new svg in the body
//     .attr("width", w) //assign the width
//     .attr("height", h) //assign the height
//     .attr("class", "container") //assign a class name
//     .style("background-color", "rgba(0,0,0,0.2)"); //svg background color

//     //innerRect block
//     var innerRect = container.append("rect")
//         .datum(400) //a single value is a DATUM
//         .attr("width", function(d){ //rectangle width
//             return d * 2; //400 * 2 = 800
//         })
//         .attr("height", function(d){ //rectangle height
//             return d; //400
//         })
//         .attr("class", "innerRect") //class name
//         .attr("x", 50) //position from left on the x (horizontal) axis
//         .attr("y", 50) //position from top on the y (vertical) axis
//         .style("fill", "#FFFFFF") //fill color


//     console.log(innerRect);


//     var cityPop = [
//         { 
//             city: 'New Orleans',
//             population: 393292
//         },
//         {
//             city: 'Minneapolis',
//             population: 422331
//         },
//         {
//             city: 'Knoxville',
//             population: 187347
//         },
//         {
//             city: 'Detroit',
//             population: 673104
//         }
//     ];
    
//     var minPop = d3.min(cityPop, function(d){
//         return d.population;
//     });

//     //find the maximum value of the array
//     var maxPop = d3.max(cityPop, function(d){
//         return d.population;
//     });

//     var x = d3.scaleLinear() //create the scale
//     .range([90, 810]) //output min and max
//     .domain([0, 3]); //input min and max

//     //scale for circles center y coordinate
//     var y = d3.scaleLinear()
//         .range([450, 50]) //was 440, 95
//         .domain([0, 700000]); //was minPop, maxPop
//         //color scale generator 
//     var color = d3.scaleLinear()
//     .range([
//         "#FDBE85",
//         "#D94701"
//     ])
//     .domain([
//         minPop, 
//         maxPop
//     ]);

//     var yAxis = d3.axisLeft(y);
    
//     //create axis g element and add axis
//     var axis = container.append("g")
//         .attr("class", "axis")
//         .attr("transform", "translate(50, 0)")
//         .call(yAxis);

//     var circles = container.selectAll(".circles") //create an empty selection
//         .data(cityPop) //here we feed in an array
//         .enter() //one of the great mysteries of the universe
//         .append("circle") //inspect the HTML--holy crap, there's some circles there
//         .attr("class", "circles")
//         .attr("id", function(d){
//             return d.city;
//         })
//         .attr("r", function(d){
//             //calculate the radius based on population value as circle area
//             var area = d.population * 0.01;
//             return Math.sqrt(area/Math.PI);
//         })
//         .attr("cx", function(d, i){
//             //use the scale generator with the index to place each circle horizontally
//             return x(i);
//         })
//         .attr("cy", function(d){
//             return y(d.population);
//         })
//         .style("fill", function(d, i){ //add a fill based on the color scale generator
//             return color(d.population);
//         })
//         .style("stroke", "#000"); //black circle stroke;

//     //create a text element and add the title
//     var title = container.append("text")
//     .attr("class", "title")
//     .attr("text-anchor", "middle")
//     .attr("x", 450)
//     .attr("y", 30)
//     .text("City Populations");

//     // create circle labels
//     var labels = container.selectAll(".labels")
//         .data(cityPop)
//         .enter()
//         .append("text")
//         .attr("class", "labels")
//         .attr("text-anchor", "left")
//         .attr("y", function(d){
//             //vertical position centered on each circle
//             return y(d.population) + 3;
//         });

//     //first line of label
//     var nameLine = labels.append("tspan")
//         .attr("class", "nameLine")
//         .attr("x", function(d,i){
//             //horizontal position to the right of each circle
//             return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//         })
//         .text(function(d){
//             return d.city;
//         });

//     //create format generator
//     var format = d3.format(",");

//     //second line of label
//     var popLine = labels.append("tspan")
//         .attr("class", "popLine")
//         .attr("x", function(d,i){
//             return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//         })
//         .attr("dy", "15") //vertical offset
//         .text(function(d){
//             return "Pop. " + format(d.population); //use format generator to format numbers
//         });

// };



//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([10.45, 51.17])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/GermanyShareofGDP.csv")); //load attributes from csv
    promises.push(d3.json("data/DEU_adm1.topojson")); //load background spatial data
    promises.push(d3.json("data/FranceRegions.topojson")); //LEFT IN FOR TESTING
    Promise.all(promises).then(callback);

    function callback(data){
        csvData = data[0];
        germany = data[1];
        france = data[2];
        console.log(csvData);
        console.log(germany);
        console.log(france);
        
        //translate europe TopoJSON
        var germanyStates = topojson.feature(germany, germany.objects.DEU_adm11-1),
        franceRegions = topojson.feature(france, france.objects.FranceRegions).features; //This file won't load either?

        //examine the results
        console.log(germanyStates);
        // console.log(franceRegions);

        //add France regions to map
        var regions = map.selectAll(".regions")
            .data(franceRegions)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);

        //create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
    
        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created

        };
}