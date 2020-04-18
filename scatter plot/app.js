//filter the data
function filterData(d){
    return d.filter(d =>{
        return(
            d.release_year > 1999 &&
            d.release_year < 2010 &&
            d.budget > 0 &&
            d.revenue > 0 &&
            d.genre &&
            d.title
        )
    });
}

//prepare data for the scatterplot
function prepareScatterData(data){
    //get top 100 most budget movies in descending order
   return data.sort((a, b) => b.budget - a.budget).filter((d, i) => i< 100);
}

//convert to date obj
function parseDate(string){
    return d3.timeParse('%Y-%m-%d')(string);
}

//convert NA to undefined
function parseNA(string) {
    return string === 'NA'? undefined : string
};

//convert to appropriate type
function convertType(d){
    const date = parseDate(d.release_date);
    return{
        budget: +d.budget,
        genre: parseNA(d.genre),
        genres: JSON.parse(d.genres).map(d => d.name),
        homepage: parseNA(d.homepage),
        id: +d.id,
        imdb_id: parseNA(d.imdb_id),
        original_language: d.original_language,
        overview: parseNA(d.overview),
        popularity: +d.popularity,
        poster_path: parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year: date.getFullYear(),
        revenue: +d.revenue,
        runtime: +d.runtime,
        status: d.status,
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        video: d.video,
        vote_average: +d.vote_average,
        vote_count: +d.vote_count
    };
}

function formatTicksX(d){
    return d3.format('~s')(d)
            .replace('M', ' mil')
            .replace('G', ' bil')
            .replace('T', ' tril')
}


//function to add labels on both axis
function addLabel(axis, label, x){
    //first argument 'label' is default passed by d3. the others need to be passed explicitely
    axis.selectAll('.tick:last-of-type text') //get the text of last tick
        .clone()                                //clone it
        .text(label)                            //give it different text label
        .attr('x', x)                           //position it at diffrent x value
        .style('font-weight', 'bold')
}

//main function
function ready(movies){
    const moviesClean = filterData(movies);
    const scatterData = prepareScatterData(moviesClean);
    
    console.log(scatterData);

    //this is a standard way of defining margins in D3
    const margin = {top : 80, right : 40, bottom : 40, left : 80};

    //scatter plot is drawn in square space
    const chartWidth = 500 - margin.left - margin.right;
    const chartHeight = 500 - margin.top - margin.bottom;

    //define the scale for x-axis
    //some values directly appear on the line of the x axis. so we lower the min value and increase the max value on the bar just a little bit
    xExtent = d3.extent(scatterData, d => d.budget)
                .map((d, i) => i === 0 ? d * 0.95 : d * 1.05);

    const xScale = d3.scaleLinear()
                    .domain(xExtent) // get the range of actual value
                    .range([0, chartWidth]); // set the range on the webpage in pixels. actual values will be mapped to these values

    //define scale for y-axis
    yExtent = d3.extent(scatterData, d => d.revenue)
                .map((d, i) => i === 0 ? d * 0.1 : d * 1.1);
    const yScale = d3.scaleLinear()
                    .domain(yExtent) // get the range of actual value
                    .range([chartHeight, 0]); // the directins of SVG co-ordinate on y axis and the scatter plot y axis are opposite
    //IMP : xScale and yScale are NOT values. They are functions
    //debugger

    //create SVG base
    const svg = d3.select('.scatterPlotContainer')
        .append('svg')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.right})`);   //shift it to appropriate place based on margin values


    //draw text headers
    //drawing text headers with SVG is not recommended. Use HTML instead
    //this is just in case there is no option
    const header = svg.append('g')
                    .attr('class', 'bar-header')
                    .attr('transform', `translate(0, ${-margin.top/3})`)
                    .append('text');

    header.append('tspan').text('Total Budget vs Revenue USD');  //tspan gets attached to text element
                                                                //one tspan element for each line of text

    //this thing overlaps with the first line of header
    //need to figure out the proper margin values
    // header.append('tspan')
    //     .text('Films /w budget and revenue figures, 2000-2009')
    //     .attr('x', 0)
    //     .attr('dy', '1.5em')
    //     .style('font-size', '0.8em')
    //     .style('fill', '#555');

    //Data Join with elements
    //draw bars on the created svg base

    const scatter = svg
                .append('g')
                .attr('class', 'scatter-points')
                .selectAll('.scatter')  //reserve a space for elements with class 'scatter' if it didnt exist
                .data(scatterData) //data source for the scatters
                .enter()            //everything after this function happens for each element of the data
                .append('circle')     //each element of plot is a circle basically
                .attr('class', 'scatter')   //assign the class 'scatter' to each circle element
                .attr('cx', d => xScale(d.budget))    
                .attr('cy', d => yScale(d.revenue))  
                .attr('r', 3)     
                .style('fill', 'dodgerblue')
                .style('fill-opacity', 0.7);


    //drawing axes
    //X axis
    const xAxis = d3.axisBottom(xScale) //provide the scale for this axis
                    .ticks(5)           //how many ticks D3 should show          
                    .tickFormat(formatTicksX)       //custom format function for ticks
                    .tickSizeInner(-chartHeight)    //negative value. becasue usually x-axis is at the bottom of the chart. here, its on top
                    .tickSizeOuter(0);              //dont show outer tick lines

    const xAxisDraw = svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', `translate(0, ${chartHeight})`)      //move the x-axis to the bottom
                        .call(xAxis)
                        .call(addLabel, 'Budget', 40);

    const yAxis = d3.axisLeft(yScale) //provide the scale for this axis
                    .ticks(5)               
                    .tickFormat(formatTicksX)       //custom format function for ticks
                    .tickSizeInner(-chartHeight)    //negative value. becasue usually x-axis is at the bottom of the chart. here, its on top
                    .tickSizeOuter(0);              //dont show outer tick lines
    
    const yAxisDraw = svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis)
                        .call(addLabel, 'Revenue', 50);

    yAxisDraw.selectAll('text').attr('dx', '-0.6em');   //changing the text size on y axis

}

//load data
d3.csv('data/movies.csv', convertType).then(res => {
    ready(res);
});