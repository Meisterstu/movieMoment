fetch('http://www.omdbapi.com/?i=tt3896198&apikey=17a1e0cd')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
        console.log(data);
    });

fetch('https://api.kinocheck.de/movies?imdb_id=tt3896198')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data);
    })

omdbApiKey='17a1e0cd';

$(document).ready(function () {
    const searchInput = $('#search-input');
    const dropdownMenu = $('#search-form .dropdown-menu');
    const movieTitleElement = $('#movie-title');
    const moviePosterElement = $('#movie-poster');
    const movieInfoElement = $('#movie-info');

    // Event listener for the search form
    searchInput.on('input', function () {
        const movieTitle = searchInput.val();
        searchMovies(movieTitle);
    });

    // Function to search for movies using the OMDB API and display suggestions
    function searchMovies(movieTitle) {
        // Clear previous suggestions
        resetSuggestions();

        omdbQueryURL='https://www.omdbapi.com/?apikey=' + omdbApiKey + '&s=' + movieTitle

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
                .catch(function(error) {
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

        suggestions.forEach(function(movie){
            const suggestionItem = $('<a>')
                .addClass('dropdown-item')
                .attr('href', '#')
                .text(movie.Title + ' (' + movie.Year + ')'                )
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
                        '<p>Genre: ' + data.Genre + '</p>' +
                        '<p>Plot: ' + data.Plot + '</p>' +
                        '<p>Rated: ' + data.Rated + '</p>' +
                        '<p>Runtime: ' + data.Runtime + '</p>' +
                        '<p>Year: ' + data.Year + '</p>' +
                        '<p>IMDb Rating: ' + data.imdbRating + '</p>'
                    );
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
});

  