

// API for OMDB
let movie = $(this).attr("data-name");
let omdbURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=17a1e0cd";
fetch(omdbURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    });

let movieID = data.imdbID;
let year = data.Year;
let plot = plot = data.Plot;
let imgURL = data.Poster;

// API for KinoCheck
fetch('https://api.kinocheck.de/movies?imdb_id=tt3896198')
fetch(kinoURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
    })


// user enters movie name and clicks on search button
// ...pushes movie name to #movie-title
// ...pushes movie details to #movie-details
// ......details tbc
// ...pushes movie poster to #movie-poster

// user clicks save to watchlist - pushes movie name to #history and to local storage


// user clicks clear history button 
// clears #history
// clears local storage?


