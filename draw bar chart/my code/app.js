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

//prepare data for the bar chart
function prepareBarChartData(data){
    //things to ponder on : the nest function ignores the property names such as genre and revenue
    //instead it converts them into an object {key: '' , value : ''}
    //we lose the reference to the original property names
    const rollUpData = d3.nest()
                    .key(d =>  d.genre)
                    .rollup(v => d3.sum(v, m =>  m.revenue))
                    .entries(data);

                    return rollUpData;
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

//main function
function ready(movies){
    const moviesClean = filterData(movies);

    const barChartData = prepareBarChartData(moviesClean).sort((a,b) =>{
        return d3.descending(a.value, b.value);
    });
    
    console.log(barChartData);

    //this is a standard way of defining margins in D3
    const margin = {top : 80, right : 40, bottom : 40, left : 80};
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 500 - margin.top - margin.bottom;

    const xMax = d3.max(barChartData, d => d.value); //get max revenue value fromm the data


    //define the scale for x-axis
    const xScale = d3.scaleLinear()
                    .domain([0, xMax]) // get the range of actual value
                    .range([0, chartWidth]); // set the range on the webpage in pixels. actual values will be mapped to these values

    //define scale for y-axis
    const yScale = d3.scaleBand()
                    .domain(barChartData.map(d => d.key)) //get array of film categories
                    .rangeRound([0, chartHeight])
                    .paddingInner(0.25);
    //IMP : xScale and yScale are NOT values. They are functions
    //debugger

    //create SVG base
    const svg = d3.select('.barChartContainer')
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

    header.append('tspan').text('Total Revenue by Genre USD');  //tspan gets attached to text element
                                                                //one tspan element for each line of text

    //this thing overlaps with the first line of header
    //need to figure out the proper margin values
    // header.append('tspan')
    //     .text('Films /w budget and revenue figures, 2000-2009')
    //     .attr('x', 0)
    //     .attr('dy', '1.5em')
    //     .style('font-size', '0.8em')
    //     .style('fill', '#555');

    //draw bars on the created svg base
    const bars = svg
                .selectAll('.bar')  //reserve a space for elements with class 'bar' if it didnt exist
                .data(barChartData) //data source for the bars
                .enter()            //everything after this function happens for each element of the data
                .append('rect')     //each element of bar is a rectagle basically
                .attr('class', 'bar')   //assign the class 'bar' to each rectangle element
                .attr('y', d => yScale(d.key))    //on y axis, show each element from the list of genres returned by the yScale
                .attr('width', d => xScale(d.value))  //the width of each recatngle will be adjusted value as per the xScale
                .attr('height', yScale.bandwidth())     //height of the rectangle will adjusted by the yScale depending on the available size
                .style('fill', 'dodgerblue');


    //drawing axes
    //X axis
    const xAxis = d3.axisTop(xScale)                //provide the scale for this axis
                    .tickFormat(formatTicksX)       //custom format function for ticks
                    .tickSizeInner(-chartHeight)    //negative value. becasue usually x-axis is at the bottom of the chart. here, its on top
                    .tickSizeOuter(0);              //dont show outer tick lines

    const xAxisDraw = svg.append('g')
                        .attr('class', 'x axis')
                        .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
                    .tickSize(0);       //dont show any ticks

    const yAxisDraw = svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

    yAxisDraw.selectAll('text').attr('dx', '-0.6em');   //changing the text size on y axis

}

//load data
d3.csv('data/movies.csv', convertType).then(res => {
    ready(res);
});