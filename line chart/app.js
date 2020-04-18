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

function formatTicks(d){
    return d3.format('~s')(d)
            .replace('M', ' mil')
            .replace('G', ' bil')
            .replace('T', ' tril')
}

//prepare data for the line chart
function prepareLineChartData(data){

    //this function takes release_year as key
    const groupBy = d => d.release_year;

    //this function will give sum of revenues
    const reduceRevenue = values => d3.sum(values, leaf => leaf.revenue);

    //this function gives sum of revenues for each year
    const revenueMap = d3.nest()
                    .key(groupBy)
                    .rollup(reduceRevenue)
                    .entries(data);

    const reduceBudget = values => d3.sum(values, leaf => leaf.budget);
    //this function gives sum of budget for each year
    const budgetMap = d3.nest()
                    .key(groupBy)
                    .rollup(reduceBudget)
                    .entries(data);

    //convert to array of objects sorted by year
    const revenue = Array.from(revenueMap).sort((a,b) => a.key - b.key);
    const budget = Array.from(budgetMap).sort((a,b) => a.key - b.key);

    //convert year into date object
    const parseYear = d3.timeParse('%Y');
    const dates = revenue.map(d => parseYear(d.key));

    const yValues = [
        ...revenueMap.map(d => d.value),
        ...budgetMap.map(d => d.value)
    ]
    //find max of budget and revenue
    //this max value serves as end point for y axis   
    const yMax = d3.max(yValues);

    const lineData = {
        series : [
            {
                name : 'Revenue',
                color : 'dodgerblue',
                //convert key to date object. we need date object because it needs to match with the format and values of dates on the xAxis
                values : revenue.map(d => ({key : parseYear(d.key), value : d.value}))
            },
            {
                name : 'Budget',
                color : 'darkorange',
                //convert key to date object. we need date object because it needs to match with the format and values of dates on the xAxis
                values : budget.map(d => ({key : parseYear(d.key), value : d.value}))
            }
        ],
        dates : dates,
        yMax : yMax
    };

    return lineData;
}

//main function
function ready(movies){
    const moviesClean = filterData(movies);
    const lineChartData = prepareLineChartData(moviesClean);
    
    console.log(lineChartData);

    //this is a standard way of defining margins in D3
    const margin = {top : 80, right : 60, bottom : 40, left : 80};

    //scatter plot is drawn in square space
    const chartWidth = 500 - margin.left - margin.right;
    const chartHeight = 500 - margin.top - margin.bottom;

    //define the scale for x-axis

    const xScale = d3.scaleTime()
                    .domain(d3.extent(lineChartData.dates))
                    .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
                    .domain([0, lineChartData.yMax])
                    .range([chartHeight , 0]);

    //IMP : xScale and yScale are NOT values. They are functions
    //debugger

    const lineGen = d3.line()
                    .x(d => xScale(d.key))
                    .y(d => yScale(d.value));

    //create SVG base
    const svg = d3.select('.lineChartContainer')
        .append('svg')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.right})`);   //shift it to appropriate place based on margin values

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

    const xAxisDraw = svg.append('g')
                        .attr('transform', `translate(0, ${chartHeight})`)
                        .attr('class', 'x axis')
                        .call(xAxis);

    const yAxis = d3.axisLeft(yScale)
                    .ticks(5)
                    .tickFormat(formatTicks)
                    .tickSizeOuter(0)
                    .tickSizeInner(-chartWidth);

    const yAxisDraw = svg.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

    const chartGroup = svg.append('g').attr('class', 'line-chart');

    //draw the lines
    chartGroup.selectAll('.line-series')
            .data(lineChartData.series)
            .enter()
            .append('path')
            .attr('class', d => `line-series ${d.name.toLowerCase()}`)
            .attr('d', d => lineGen(d.values))
            .style('fill', 'none')      //necessary. otherwise we will get a solid area filled with color 
            .style('stroke', d => d.color);

    //positioning the labels of the lines at the end of lines
    chartGroup.append('g')
            .attr('class', 'series-labels')
            .selectAll('.series-label')
            .data(lineChartData.series)
            .enter()
            .append('text')
            .attr('x', d => xScale(d.values[d.values.length - 1].key) + 5)
            .attr('y', d => yScale(d.values[d.values.length - 1].value))
            .text(d => d.name)
            .style('dominant-baseline', 'central')
            .style('font-size', '0.7em')
            .style('font-weight', 'bold')
            .style('fill', d => d.color);

    //draw text headers
    //drawing text headers with SVG is not recommended. Use HTML instead
    //this is just in case there is no option
    const header = svg.append('g')
                    .attr('class', 'bar-header')
                    .attr('transform', `translate(0, ${-margin.top/3})`)
                    .append('text');

    header.append('tspan').text('Budget and Revenue over time in USD');  //tspan gets attached to text element
                                                                //one tspan element for each line of text

}

//load data
d3.csv('data/movies.csv', convertType).then(res => {
    ready(res);
});