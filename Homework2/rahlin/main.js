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
        bars.enter().append("rect")
        .attr("x", d => barX(d.Egg_Group_1))
        .attr("y", d => barY(d.count))
        .attr("width", barX.bandwidth())
        .attr("height", d => barHeight - barY(d.count))
        .attr("fill", d => colorsForBar(d.Egg_Group_1));

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
        const gen4 = rawData.filter(d => d.Generation === 4); // to filter for generation 4 pokemon in scatterplot
        const typeNums = gen4.reduce((s, { Type_1 }) => (s[Type_1] = (s[Type_1] || 0) + 1, s), {}); // to count number of types 
        const dataForTypes = Object.keys(typeNums).map(key => ({ Type_1 : key, count: typeNums[key] })); // convert to object array  

        const g2 = svg.append("g")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
        .attr("transform", `translate(${scatterLeft + scatterMargin.left}, ${scatterTop + scatterMargin.top})`);

        // title
        g2.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -15)
        .attr("font-size", titleSize + "px") 
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Generation 4 Pokemon Base Special Defense vs Base Special Attack");

        // x-axis label
        g2.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 50)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .text("Base Special Defense");

        // y-axis label
        g2.append("text")
        .attr("x", -(scatterHeight / 2))
        .attr("y", -40)
        .attr("font-size", axisSize + "px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Base Special Attack");

        // x-axis ticks
        const scatterX = d3.scaleLinear() // for linear scale of values 
        .domain([0, d3.max(gen4, d => d.Sp_Def)]) // x-axis use base special defense
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
        .domain([0, d3.max(gen4, d => d.Sp_Atk)]) // x-axis use base special attack
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

        const points = g2.selectAll("circle").data(gen4); 

        points.enter().append("circle")
            .attr("cx", d => scatterX(d.Sp_Def))
            .attr("cy", d => scatterY(d.Sp_Atk))
            .attr("r", pointRadius) 
            .attr("fill", d => colorTypes(d.Type_1));

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

        // for Parallel Coordinates Plot
        const gen1 = rawData.filter(d => d.Generation === 1); // filter for generation 1 since this plot will focus on it 
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
        .attr("x", parallelWidth / 2) 
        .attr("y", -30)
        .attr("font-size", titleSize + "px")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text("Stats for Generation 1 Pokemon with vs without Mega Evolution");

        const yValues = {};
        pokemonStats.forEach(stat => {
            if (stat.type === "number") {
                yValues[stat.name] = d3.scaleLinear() // create linear scale for different stats
                    .domain(d3.extent(gen1, d => +d[stat.name])) // used generative AI for d3 extent to find max and mins for specific stat
                    .range([parallelHeight, 0])
                    .nice();
            }
            else {
                const values = [...new Set(gen1.map(d => d[stat.name]))].sort(d3.ascending); // used generative AI for the set and to sort for ascending
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
        g3.selectAll("path")
        .data(gen1)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", d => parallelColors(d.hasMegaEvolution))
        .attr("stroke-opacity", 0.5)
        .attr("d", d => d3.line()(pokemonStats.map(stat => [
            xValues(stat.name),
            yValues[stat.name](d[stat.name])
        ])));
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