// load pokemon csv 

d3.csv("pokemon_alopez247.csv").then(rawData => {
    console.log("rawData", rawData);
    
    // collect data from data set
    rawData.forEach(function(d){
        d.hasMegaEvolution = d.hasMegaEvolution.toUpperCase(); // set these strings to all uppercase for easier processing
        d.Total = Number(d.Total);
        d.HP = Number(d.HP);
        d.Attack = Number(d.Attack);
        d.Defense = Number(d.Defense);
        d.Sp_Atk = Number(d.Sp_Atk);
        d.Sp_Def = Number(d.Sp_Def);
        d.Speed = Number(d.Speed)
        d.Generation = Number(d.Generation);
    });
    
    // function to make graphs 
    function graphs(){
        // create tooltip to provide info when hovering data
        const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background", "black")
        .style("color", "white")
        .style("padding", "12px 16px")
        .style("font-size", "12px")
        .style("font-family", "Arial")
        .style("opacity", 0)
        .style("z-index", 1000);
        
        const svg = d3.select("svg"); // select svg element
        svg.selectAll("*").remove(); // clear existing svg (learned from generative AI for chart resizing)

        // for dynamic resizing 
        const width = window.innerWidth;
        const height = window.innerHeight;
        const titleSize = Math.min(width * 0.015, 20); // learned from generative AI how to adjust text size and circle radius dynamically
        const axisSize = Math.min(width * 0.015, 18); // dynamic font size for axis size
        const legendSize = Math.min(width * 0.01, 10); // dynamic size for legend
        const legendHeight = Math.min(height * 0.01, 10); // dynamic size for legend 
        const pointRadius = Math.min(width * 0.005, 5); // dynamic size for points on scatterplot

        // based on HW 2 template but changed measurements
        // for bar chart
        let barLeft = width * 0.05, barTop = 30;
        let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
            barWidth = width * 0.3 - barMargin.left - barMargin.right,
            barHeight = height * 0.4 - barMargin.top - barMargin.bottom;

        // for scatter plot
        let scatterLeft = barWidth + width * 0.35, scatterTop = 30;
        let scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
            scatterWidth = width * 0.3 - scatterMargin.left - scatterMargin.right,
            scatterHeight = height * 0.4 - scatterMargin.top - scatterMargin.bottom;

        // for parallel coordinates plot
        let parallelTop = barHeight + barTop + barMargin.top + 100;
        let parallelMargin = {top: 30, right: 150, bottom: 20, left: 50},
            parallelWidth = width - parallelMargin.left - parallelMargin.right,
            parallelHeight = height - parallelTop - parallelMargin.top - parallelMargin.bottom;

        const eggGroupNums = rawData.reduce((s, { Egg_Group_1 }) => (s[Egg_Group_1] = (s[Egg_Group_1] || 0) + 1, s), {}); // count how many different egg groups there are
        const dataForEggs = Object.keys(eggGroupNums).map(key => ({ Egg_Group_1: key, count: eggGroupNums[key] }));
        
        // asked generative AI to generate a list of distinct colors
        const eggColors = [
            "#e57373", // soft red
            "#f7b26b", // warm orange
            "#fff176", // mellow yellow
            "#81c784", // soft green
            "#64b5f6", // sky blue
            "#b39ddb", // soft lavender
            "#f48fb1", // rose pink
            "#4dd0e1", // light teal
            "#aed581", // grassy green
            "#ffb74d", // orange tint
            "#9575cd", // medium purple
            "#ff8a65", // coral
            "#a1887f", // brownish gray
            "#4db6ac", // turquoise
            "#e0aaff", // lilac
            "#7986cb", // dusty blue
            "#c0ca33", // olive yellow-green
            "#90a4ae"  // muted gray-blue
        ];
        
        // set different colors for each egg group
        const colorsForBar = d3.scaleOrdinal() // use scale ordinal for color scale
        .domain(dataForEggs.map(d => d.Egg_Group_1))
        .range(eggColors);

        console.log("dataForEggs", dataForEggs);

        // bar chart based on template 
        const g1 = svg.append("g")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .attr("transform", `translate(${barLeft + barMargin.left}, ${barTop + barMargin.top})`);
        
        // title
        g1.append("text")
        .attr("x", barWidth / 2)
        .attr("y", -15)
        .attr("font-size", titleSize + "px") // used generative AI to learn how to change title size with window size
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Egg Group Type Counts across all Generations");

        // x-axis label
        g1.append("text")
        .attr("x", barWidth / 2)
        .attr("y", barHeight + 70)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .text("Egg Group Type");

        // y-axis label
        g1.append("text")
        .attr("x", -(barHeight / 2))
        .attr("y", -40)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Pokemon");

        // x-axis ticks
        const barX = d3.scaleBand() // for categories in bar chart
        .domain(dataForEggs.map(d => d.Egg_Group_1)) // use egg group types for x-axis
        .range([0, barWidth])
        .paddingInner(0.3)
        .paddingOuter(0.2);

        const barxAxis = d3.axisBottom(barX); // set axis bottom with x-axis ticks
        g1.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(barxAxis)
        .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("font-size", legendSize + "px")
            .attr("transform", "rotate(-40)");

        // y-axis ticks
        const barY = d3.scaleLinear() // set y-axis ticks with linear scale
        .domain([0, d3.max(dataForEggs, d => d.count)]) // domain is count of pokemon per egg group type
        .range([barHeight, 0])
        .nice();

        const baryAxis = d3.axisLeft(barY).ticks(18); // set y-axis ticks for number of pokemon
        g1.append("g")
        .call(baryAxis)
        .selectAll("text")
            .attr("font-size", legendSize + "px");

        // for the bars in graph
        const bars = g1.selectAll("rect").data(dataForEggs);
        const barInfo = bars.enter().append("rect")
        .attr("x", d => barX(d.Egg_Group_1))
        .attr("y", d => barHeight)
        .attr("width", barX.bandwidth())
        .attr("height", 0)
        .attr("fill", d => colorsForBar(d.Egg_Group_1));
        barInfo 
        .on("click", function(d){  // for choosing bar of egg group for scatter plot to focus on
            g1.selectAll("rect").attr("stroke", null);
            console.log("Bar clicked:", d.Egg_Group_1);
            d3.select(this) // to select the bar
            .attr("stroke", "black")
            .attr("stroke-width", 2);
            changeScatter(d.Egg_Group_1); // call function to filter the scatter plot points for specific egg group for drill-down
        })
        .on("mouseover", function(d){ // when hover with tooltip, set outline to gray and display information
            d3.select(this)
            .attr("stroke", "gray")
            .attr("stroke-width", 2);
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)

            // asked generative AI how to create textbox with information when tooltip mouseover
            tooltip.html(` 
                <div style = "font-weight": bold; color: #FFFFFF; margin-bottom: 4px;">
                Egg Group: ${d.Egg_Group_1}
                </div>
                <div style = "margin-bottom: 2px;">
                Pokemon Count: ${d.count}
                </div>
                <div style = "font-size: 11px; color: #FFFFFF";>
                Click to filter scatter plot! 
                </div>
                `)
            .style("left", (d3.event.pageX + 15) + "px") 
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mousemove", function(){ // if the mouse moves, update position
            tooltip
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mouseout", function(){ // when the mouse no longer hovers bars
            d3.select(this)
            .attr("stroke", null); // remove the outline
            // hide tooltip
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
        });
        // for animating the bars growth to emphasize which are taller than others
        barInfo 
        .transition()
        .duration(1500)
        .delay((d,i)=> i *100)
        .attr("height", d => barHeight - barY(d.count))
        .attr("y", d => barY(d.count));

        // for creating the legend
        const legend = svg.append("g")
        .attr("transform", `translate(${barLeft + barMargin.left + barWidth + 20}, ${barTop + barMargin.top})`);

        dataForEggs.forEach((d, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * legendSize * 1.5})`);
            
            legendRow.append("rect") // for rectangles of colors in legend 
                .attr("width", legendSize) // dynamic width
                .attr("height", legendHeight) // dynamic rectangle
                .attr("fill", colorsForBar(d.Egg_Group_1)); // set colors of rectangles as categories from egg groups

            legendRow.append("text") // for text in legend
                .attr("x", legendSize + 5) 
                .attr("y", legendSize * 0.75)
                .attr("font-size", legendSize + "px") // dynamic text
                .attr("text-anchor", "start")
                .style("text-transform", "capitalize")
                .text(d.Egg_Group_1); // category with rectangles
        });
        
        // scatterplot based on template 
        const typeNums = rawData.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {}); // to count number of types 
        const dataForTypes = Object.keys(typeNums).map(key => ({ Type_1 : key, count: typeNums[key] })); // convert to object array  

        const g2 = svg.append("g")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .attr("transform", `translate(${scatterLeft + scatterMargin.left}, ${scatterTop + scatterMargin.top})`);

        // title
        g2.append("text")
        .attr("class", "scatterTitle")
        .attr("x", scatterWidth / 2)
        .attr("y", -15)
        .attr("font-size", titleSize + "px") 
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("All Pokemon Base Special Defense vs Base Special Attack");

        // x-axis label
        g2.append("text")
        .attr("class", "scatterXLabel")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 50)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .text("Base Special Defense");

        // y-axis label
        g2.append("text")
        .attr("class", "scatterYLabel")
        .attr("x", -(scatterHeight / 2))
        .attr("y", -40)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Base Special Attack");

        // x-axis ticks
        const scatterX = d3.scaleLinear() // for linear scale of values 
        .domain([0, d3.max(rawData, d => d.Sp_Def)]) // x-axis use base special defense
        .range([0, scatterWidth])
        .nice();

        const scatterxAxis = d3.axisBottom(scatterX).ticks(16); // set scatterplot x-axis
        g2.append("g") 
        .attr("transform", `translate(0, ${scatterHeight})`)
        .call(scatterxAxis)
        .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("text-anchor", "end")
            .attr("font-size", legendSize + "px")
            .attr("transform", "rotate(-40)");

        // y-axis ticks
        const scatterY = d3.scaleLinear() // for linear scale of values 
        .domain([0, d3.max(rawData, d => d.Sp_Atk)]) // x-axis use base special attack
        .range([scatterHeight, 0]); 

        const scatteryAxis = d3.axisLeft(scatterY).ticks(15); // set y-axis 
        g2.append("g")
        .call(scatteryAxis)
        .selectAll("text")
            .attr("font-size", legendSize + "px");

        // asked generative AI to generate a list of distinct colors
        const typeColors = [
            "#E41A1C", // red
            "#377EB8", // blue
            "#4DAF4A", // green
            "#984EA3", // purple
            "#FF7F00", // orange
            "#FFDF00", // gold
            "#A65628", // brown
            "#F781BF", // pink
            "#3C20A3", // purple-blue
            "#00FF00", // neon green
            "#00FFFF", // neon aqua
            "#8DA0CB", // lavender blue
            "#001EFF", // neon blue
            "#A6D854", // lime green
            "#000000", // black
            "#E5C494", // beige/tan
            "#FF13F0"  // neon pink
        ];

        // for scatter plot points 
        const colorTypes = d3.scaleOrdinal() // set categorical scale for colors for different types
        .domain(dataForTypes.map(d => d.Type_1)) // map using type 1 (primary type)
        .range(typeColors);
        function changeScatter(eggGroup) { // function to make sure scatter plot only shows points for the selected egg group 1
            const chosenEggGroup = eggGroup ? `Egg Group: ${eggGroup}`: "All Egg Groups"; // used generative AI find name of egg group

            d3.select(".scatterTitle") // to change the title depending on which egg group is being focused on
            .text(`Base Special Defense vs Base Special Attack for ${chosenEggGroup}`); 

            const eggGroupData = rawData.filter(d => !eggGroup || d.Egg_Group_1 === eggGroup);
            const points = g2.selectAll("circle")
            .data(eggGroupData, d => d.Name);

            points
            .exit() // remove the points that are not needed
            .transition().duration(300)
            .attr("r", 0)
            .remove();

            points
            .transition() // change the points that are there
            .duration(300)
            .attr("cx", d => scatterX(d.Sp_Def))
            .attr("cy", d => scatterY(d.Sp_Atk))
            .attr("fill", d => colorTypes(d.Type_1));

            points
            .enter() // to add new circles 
            .append("circle")
            .attr("cx", d => scatterX(d.Sp_Def))
            .attr("cy", d => scatterY(d.Sp_Atk))
            .attr("r", 0)
            .attr("fill", d => colorTypes(d.Type_1))
            .transition()
            .duration(300) //animation
            .attr("r", pointRadius);
        }
        changeScatter(null);
        
        // for scatter plot legend
        const scatterLegend = svg.append("g") 
            .attr("transform", `translate(${scatterLeft + scatterMargin.left + scatterWidth + 20}, ${scatterTop + scatterMargin.top})`);
        
        dataForTypes.forEach((d, i) => { // for legend 
            const scatterLegendRow = scatterLegend.append("g")
                .attr("transform", `translate(0, ${i * legendSize * 1.5})`);
            
            scatterLegendRow.append("rect")
                .attr("width", legendSize)
                .attr("height", legendHeight)
                .attr("fill", colorTypes(d.Type_1));

            scatterLegendRow.append("text")
                .attr("x", legendSize + 5)
                .attr("y", legendSize * 0.75)
                .attr("font-size", legendSize + "px")
                .attr("text-anchor", "start")
                .style("text-transform", "capitalize")
                .text(d.Type_1);
        });
        // learned from generative AI how to make brush for scatterplot
        const brush = d3.brush()
        .extent([[0,0],[scatterWidth, scatterHeight]]) // to define the area possible to be brushed in the scatter plot
        .on("start brush end", brushedPoints);

        const brushScatter = g2.append("g") // add brush to scatter plot
        .attr("class", "brush")
        .call(brush)
        .on("mouseover", function(d){ //tooltip
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)

            // asked generative AI how to create textbox with information when tooltip mouseover
            tooltip.html(` 
                <div style = "font-size: 11px; color: #FFFFFF"; margin-bottom: 2px;>
                Select Pokemon for Parallel Coordinates by Dragging!
                </div>
                <div style = "font-size: 11px; color: #FFFFFF";>
                Press outside box to reselect!
                </div>
                `)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mousemove", function(){ // update tooltip position
            tooltip
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mouseout", function(){ // hide tooltip
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
        });

        function brushedPoints() { // for the brushed points
            const selection = d3.event.selection; // get selected points
            const points = g2.selectAll("circle");

            if (!selection) { // if the points are not selected, hide them 
                points
                .attr("stroke", null)
                .attr("stroke-width", 0)
                .style("opacity", 1);
                changeParallel([]); // empty selection for change parallel function to update parallel coordinates plot
            }
            else {
                const [[x0,y0],[x1,y1]] = selection; // get the coordinates of selected points
                const selectedPoints = []; // store selected points
                points.each(function(d){
                    // learned from generative AI how to classify which points are selected
                    const cx = scatterX(d.Sp_Def);
                    const cy = scatterY(d.Sp_Atk);
                    const selected = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // to check if points were in rectangle

                    if (selected) {
                        selectedPoints.push(d); // add to array if the point was selected
                        d3.select(this)
                        .attr("stroke", "black") // outline selected point
                        .attr("stroke-width", 2)
                        .style("opacity", 1);
                    }
                    else { // lower opacity for the points that were not selected
                        d3.select(this)
                        .attr("stroke", null)
                        .style("opacity", 0.5);
                    }
                });
                changeParallel(selectedPoints); // call change parallel to update the plot for selected points
            }
        }
        function changeParallel(selectedData) { // update parallel coordinates plot based on selected points, drill-down method
            if (selectedData.length === 0) // if no points selected, show all lines 
            {
                g3.selectAll("path")
                .style("opacity", 0.5)
                .style("pointer-events", "all"); // allow all lines to be selected

                d3.select(".parallelTitle")
                .text("Stats for All Pokemon with vs without Mega Evolution (Brush Scatter Plot to Select Points)"); // make title state that all pokemon shown with instructions to brush 
                return;
            }
            // if points are selected
            d3.select(".parallelTitle") 
            .text("Stats for Selected Pokemon with vs without Mega Evolution"); // change title to specify that lines are only there for selected pokemon
            g3.selectAll("path").each(function(d){ // to update the opacity of the lines
                const path = d3.select(this);
                if (!d || !d.Name) { // to check if the data is present and hide lines without data
                    path.style("opacity",0)
                    .style("pointer-events", "none"); // make these lines unselectable
                }
                else {
                    // check if pokemon was selected
                    const dataSelected = selectedData.some(selected => selected && selected.Name === d.Name);
                    if (dataSelected) { // to show the lines for the pokemon selected
                        path.style("opacity",0.7) // change opacity from 0.5 to 0.7 with fewer lines blocking each other
                        .style("pointer-events", "all");
                    }
                    else { // if not selected, hide and make unselectable
                        path.style("opacity",0)
                        .style("pointer-events", "none");
                    }
                }
            });
        }
        
        // for Parallel Coordinates Plot
        const pokemonStats = [ // for statistics 
            { name: "Type_1", type: "string", label: "Primary Type"},
            { name: "Total", type: "number", label: "Base Stats Total"},
            { name: "HP", type: "number", label: "HP"},
            { name: "Attack", type: "number", label: "Attack"},
            { name: "Defense", type: "number", label: "Defense"},
            { name: "Sp_Atk", type: "number", label: "Special Attack"},
            { name: "Sp_Def", type: "number", label: "Special Defense"},
            { name: "Speed", type: "number", label: "Speed"},
        ]

        const g3 = svg.append("g")
        .attr("transform", `translate(${parallelMargin.left}, ${parallelTop + parallelMargin.top})`);

        // title
        g3.append("text")
        .attr("class", "parallelTitle")
        .attr("x", parallelWidth / 2) 
        .attr("y", -30)
        .attr("font-size", titleSize + "px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Stats for All Pokemon with vs without Mega Evolution (Brush Scatter Plot to Select Points)");

        const yValues = {};
        pokemonStats.forEach(stat => {
            if (stat.type === "number") {
                yValues[stat.name] = d3.scaleLinear() // create linear scale for different stats
                    .domain(d3.extent(rawData, d => +d[stat.name])) // used generative AI for d3 extent to find max and mins for specific stat
                    .range([parallelHeight, 0])
                    .nice();
            }
            else {
                const values = [...new Set(rawData.map(d => d[stat.name]))].sort(d3.ascending); // used generative AI for the set and to sort for ascending
                yValues[stat.name] = d3.scalePoint() // scale for categorical variables
                .domain(values) 
                .range([parallelHeight, 0])
            }
        });
        
        const xValues = d3.scalePoint() // to have each stat along x-axis
        .domain(pokemonStats.map(d => d.name))
        .range([0, parallelWidth]);
        
        const parallelColors = d3.scaleOrdinal() // categorical color scale for megaevolution vs no megaevolution pokemon
        .domain(["TRUE", "FALSE"])
        .range(["blue", "orange"]);

        // for the lines for the parallel coordinates plot
        const paths = g3.selectAll("path")
        .data(rawData)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", d => parallelColors(d.hasMegaEvolution))
        .attr("stroke-opacity", 0.5)
        .attr("d", d => d3.line()(pokemonStats.map(stat => [
            xValues(stat.name),
            yValues[stat.name](d[stat.name])
        ])))
        .on("mouseover", function(d){ // tooltip to get info on the pokemon per line
            d3.select(this)
            .attr("stroke-opacity", 1) 
            .attr("stroke-width", 2)
            .style("cursor", "pointer");

            tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            // display pokemon's info
            tooltip.html(` 
                <div style = "font-size: 11px; color: #FFFFFF"; margin-bottom: 2px;>
                Pokemon: ${d.Name}
                </div>
                <div style = "font-size: 11px; color: #FFFFFF"; margin-bottom: 2px;>
                Type 1: ${d.Type_1}
                </div>
                <div style = "font-size: 11px; color: #FFFFFF";>
                Total Stats: ${d.Total}
                </div>
                `)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mousemove", function(){ // update position
            tooltip
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
        })
        .on("mouseout", function(){ 
            // make line normal after selection
            d3.select(this)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 1.5)
            .style("cursor", "default");
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
        });
        // to animate the drawing of paths 
        paths.each(function(){
            const path = d3.select(this);
            const totalLength = this.getTotalLength();
            path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(4500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
        })
        // for the different axes for the each statistic
        g3.selectAll(".dimension")
        .data(pokemonStats)
        .join("g")
        .attr("class", "dimension")
        .attr("transform", d => `translate(${xValues(d.name)})`)
        .each(function(d) {
            const axis = d3.axisLeft(yValues[d.name]);
            d3.select(this)
            .call(axis)
            .selectAll("text")
                .attr("font-size", legendSize + "px");
        })
        .append("text")
        .attr("y", -9)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", legendSize + "px")
        .text(d => d.label);

        // create legend for parallel coordinates plot
        const parallelLegend = svg.append("g")
            .attr("transform", `translate(${parallelMargin.left + parallelWidth + 20}, ${parallelTop + parallelMargin.top})`);
        
        // for legend
        const megaEvos = [
            {label: "Has Mega Evolution", color: "blue"},
            {label: "No Mega Evolution", color: "orange"}
        ];
        megaEvos.forEach((d, i) => { // see comments for legend from above
            const parallelLegendRow = parallelLegend.append("g")
                .attr("transform", `translate(0, ${i * legendSize * 1.5})`);
            
            parallelLegendRow.append("rect")
                .attr("width", legendSize)
                .attr("height", legendHeight)
                .attr("fill", d.color);

            parallelLegendRow.append("text")
                .attr("x", legendSize + 5)
                .attr("y", legendSize * 0.75)
                .attr("font-size", legendSize + "px")
                .attr("text-anchor", "start")
                .style("text-transform", "capitalize")
                .text(d.label);
        });
    }
    graphs();

    // for dynamic resizing
    window.addEventListener("resize", () => {
        graphs();
    });

    }).catch(function(error){
    console.log(error);
});