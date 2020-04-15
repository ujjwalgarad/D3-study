// Data preparation.
function filterData(data) {
  return data.filter(d => {
    return (
      d.release_year > 1999 &&
      d.release_year < 2010 &&
      d.revenue > 0 &&
      d.budget > 0 &&
      d.genre &&
      d.title
    );
  });
}

function prepareBarChartData(data) {
  const dataMap = d3.rollup(
    data,
    v => d3.sum(v, leaf => leaf.revenue),
    d => d.genre
  );

  const dataArray = Array.from(dataMap, d => ({ genre: d[0], revenue: d[1] }));

  return dataArray;
}

// Main function.
function ready(movies) {
  const moviesClean = filterData(movies);
  const barChartData = prepareBarChartData(moviesClean).sort((a, b) => {
    return d3.descending(a.revenue, b.revenue);
  });
  console.log(barChartData);
}

// Data utilities.
const parseNA = string => (string === 'NA' ? undefined : string);
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);

// Type conversion.
function type(d) {
  const date = parseDate(d.release_date);
  return {
    budget: +d.budget,
    genre: parseNA(d.genre),
    genres: JSON.parse(d.genres).map(d => d.name),
    homepage: parseNA(d.homepage),
    id: +d.id,
    imdb_id: parseNA(d.imdb_id),
    original_language: parseNA(d.original_language),
    overview: parseNA(d.overview),
    popularity: +d.popularity,
    poster_path: parseNA(d.poster_path),
    production_countries: JSON.parse(d.production_countries),
    release_date: date,
    release_year: date.getFullYear(),
    revenue: +d.revenue,
    runtime: +d.runtime,
    tagline: parseNA(d.tagline),
    title: parseNA(d.title),
    vote_average: +d.vote_average,
    vote_count: +d.vote_count,
  };
}

// Load data.
d3.csv('data/movies.csv', type).then(res => {
  ready(res);
});
