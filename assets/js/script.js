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


omdbApiKey = '17a1e0cd';

const searchInput = $('#search-input');
const dropdownMenu = $('#search-form .dropdown-menu');
const movieTitleElement = $('#movie-title');
const moviePosterElement = $('#movie-poster');
const movieInfoElement = $('#movie-info');
const watchlistContainer = $('#history');

$(document).ready(function () {

    // Hide sections initially
    $('#movie-header, #movie-details, #movie-trailer').hide();

    // Function to show movie sections (to be triggered on movie search or watchlist button click)
    function showMovieSections() {
        $('#movie-header, #movie-details, #movie-trailer').show();
    }
    // user enters movie name and clicks on search button
    // ...pushes movie name to #movie-title
    // ...pushes movie details to #movie-details
    // ......details tbc
    // ...pushes movie poster to #movie-poster

    // Event listener for the search form
    searchInput.on('input', function () {
        const movieTitle = searchInput.val();
        searchMovies(movieTitle);
    });

    // Function to search for movies using the OMDB API and display suggestions
    function searchMovies(movieTitle) {
        // Clear previous suggestions
        resetSuggestions();

        omdbQueryURL = 'https://www.omdbapi.com/?apikey=' + omdbApiKey + '&s=' + movieTitle

        if (movieTitle.trim() !== '') {
            // Make API request to OMDB
            fetch(omdbQueryURL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (data.Response === 'True' && data.Search) {
                        displaySuggestions(data.Search);
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching movie suggestions', error);
                });
        } else {
            resetSuggestions();
        }
    }

    // Function to display movie suggestions in the dropdown
    function displaySuggestions(suggestions) {
        dropdownMenu.empty();
        // Position the dropdown beneath the search input
        const position = searchInput.position();
        // Need this so that the suggestions appear in the right place
        dropdownMenu.css({
            top: position.top + searchInput.outerHeight(),
            left: position.left,
            position: 'absolute',
            width: searchInput.outerWidth()
        });

        suggestions.forEach(function (movie) {
            const suggestionItem = $('<a>')
                .addClass('dropdown-item')
                .attr('href', '#')
                .text(movie.Title + ' (' + movie.Year + ')')
                .on('click', function (event) {
                    event.preventDefault();
                    console.log('Selected movie: ' + movie.Title
                    );
                    getMovieDetails(movie.imdbID);
                    resetSuggestions();
                });
            dropdownMenu.append(suggestionItem);
        });
        dropdownMenu.show();
    }

    function getMovieDetails(imdbID) {
        const omdbDetailURL = 'https://www.omdbapi.com/?apikey=' + omdbApiKey + '&i=' + imdbID
        fetch(omdbDetailURL)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    // Update with movie details
                    movieTitleElement.text(data.Title);
                    moviePosterElement.attr('src', data.Poster);
                    movieInfoElement.html(
                        '<p>Director: ' + data.Director + '</p>' +
                        '<p>Actors: ' + data.Actors + '</p>' +
                        '<p>Genre: ' + data.Genre + '</p>' +
                        '<p>Plot: ' + data.Plot + '</p>' +
                        '<p>Rated: ' + data.Rated + '</p>' +
                        '<p>Runtime: ' + data.Runtime + '</p>' +
                        '<p>Year: ' + data.Year + '</p>' +
                        '<p>IMDb Rating: ' + data.imdbRating + '</p>' +
                        '<p id="imdbID" style="display: none;">' + data.imdbID + '</p>'
                    );
                    showMovieSections();
                }
            })
            .catch(error => {
                console.error('Error fetching movie details', error);
            });
    }

    // Function to reset movie suggestions in the dropdown
    function resetSuggestions() {
        dropdownMenu.empty();
        dropdownMenu.hide();
    }


    // user clicks save to watchlist - pushes movie name to #history and to local storage
    // Function to save a movie to the watchlist in local storage
    function saveToWatchlist(movie) {
        // Retrieve existing watchlist from local storage
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        // Check if the movie is not already in the watchlist
        if (!watchlist.some(item => item.imdbID === movie.imdbID)) {
            // Add the movie to the watchlist
            watchlist.push({
                imdbID: movie.imdbID,
                title: movie.title
            });

            // Save the updated watchlist back to local storage
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
        }
    }




    // event listener for save to watchlist button 
    $('#save-to-watchlist').on('click', function (event) {
        event.preventDefault();
        const movieTitle = $('#movie-title').text();
        const imdbID = $('#imdbID').text();
        // CHECK THIS WORKS
        console.log(imdbID);
        // Create a button or list item for the watchlist
        const watchlistItem = $('<button>')
            .addClass('btn btn-secondary watchlist-item')
            .text(movieTitle)
            //test this line below
            .data('imdbID', imdbID)
            .on('click', function () {
                getMovieDetails(imdbID);
            });
        // Append the watchlist item to the watchlist container
        watchlistContainer.append(watchlistItem);
        // Save the movie to the watchlist in local storage
        saveToWatchlist({ imdbID: imdbID, title: movieTitle });
    });

    // Event listener for the clear history button
    $('#clear-history-button').on('click', function () {
        // Clear local storage
        localStorage.clear();

        // Clear the watchlist container
        watchlistContainer.empty();
    });

    // Function to populate watchlist from local storage
    function populateWatchlistFromLocalStorage() {
        // Retrieve existing watchlist from local storage
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        // Loop through each item in the watchlist and create watchlist items
        watchlist.forEach(function (movie) {
            const watchlistItem = $('<button>')
                .addClass('btn btn-secondary watchlist-item')
                .text(movie.title)
                .data('imdbID', movie.imdbID)
                .on('click', function () {
                    // When a watchlist item is clicked, get and display movie details
                    getMovieDetails(movie.imdbID);
                    showMovieSections();
                });

            // Append the watchlist item to the watchlist container
            watchlistContainer.append(watchlistItem);
        });
    }

    // Populate watchlist from local storage on page load
    populateWatchlistFromLocalStorage();

    // user clicks clear history button 
    // clears #history
    // clears local storage?



    // API for KinoCheck
    fetch('https://api.kinocheck.de/movies?imdb_id=tt3896198')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        })

    //KinoCheck to match against imdbID  
    //Generate movie trailer

});