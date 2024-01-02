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
const movieContainer = $('#movie-container');
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

    // Function to get movie details from omdb API
    function getMovieDetails(imdbID) {
        const omdbDetailURL = 'https://www.omdbapi.com/?apikey=' + omdbApiKey + '&i=' + imdbID
        fetch(omdbDetailURL)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    // Update with movie details
                    movieContainer.attr('class', 'col-lg-9 pb-3 container mb-4 bg-secondary rounded-3');
                    movieTitleElement.text(data.Title);
                    moviePosterElement.attr('src', data.Poster);
                    movieInfoElement.html(
                        '<h6>' + data.Plot + '</h6>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Director</span>&nbsp;&nbsp;&nbsp;&nbsp;' + data.Director + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Actors</span> &nbsp;&nbsp;&nbsp;&nbsp;' + data.Actors + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Genre</span> &nbsp;&nbsp;&nbsp;&nbsp;' + data.Genre + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Rated</span> &nbsp;&nbsp;&nbsp;&nbsp;' + data.Rated + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Runtime</span>&nbsp;&nbsp;&nbsp;&nbsp;' + data.Runtime + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">Year</span> &nbsp;&nbsp;&nbsp;&nbsp;' + data.Year + '</p>' +
                        '<hr>' +
                        '<p><span class="movieInfo-bold">IMDb Rating</span> &nbsp;&nbsp;&nbsp;&nbsp;' + data.imdbRating + '/10</p>' +
                        '<hr>' +
                        '<p id="imdbID" style="display: none;">' + data.imdbID + '</p>' +

                        '<h6 id="details-header" class="mt-5 h6">Trailer</h6>'
                    );
                    showMovieSections();
                    // Fetch movie trailer from KinoCheck using IMDb ID
                    fetchKinoCheckTrailer(imdbID,data.Title);
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

    // Function to show the duplicate film modal
    function showDuplicateFilmModal() {
        $('#duplicateFilmModal').modal('show');

        // Remove existing click event listeners
        $('#duplicateFilmModal .close, #duplicateFilmModal [data-dismiss="modal"]').off('click');

        // Add new click event listeners
        $('#duplicateFilmModal .close, #duplicateFilmModal [data-dismiss="modal"]').on('click', function () {
            $('#duplicateFilmModal').modal('hide');
        });
    }

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

    // Function to populate watchlist from local storage
    function populateWatchlistFromLocalStorage() {
        // Retrieve existing watchlist from local storage
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        // Loop through each item in the watchlist and create watchlist items
        watchlist.forEach(function (movie) {
            const watchlistItem = $('<div>')
                .addClass('watchlist-item mb-3 d-flex justify-content-between align-items-center')
                .append(
                    $('<button>')
                        .addClass('btn btn-secondary movie-info-button')
                        .text(movie.title)
                        .data('imdbID', movie.imdbID)
                        .on('click', function () {
                            getMovieDetails(movie.imdbID);
                        }),
                    $('<button>')
                        .addClass('btn btn-danger close-button')
                        .html('<i class="fa-solid fa-xmark"></i>')
                        .on('click', function (event) {
                            // Prevents the click event from triggering on the movie info button
                            event.stopPropagation();
                            // Remove the movie from local storage
                            removeMovieFromLocalStorage(movie.imdbID);
                            // Remove the movie display from the DOM
                            $(this).parent('.watchlist-item').remove();
                        })
                );

            // Append the watchlist item to the watchlist container
            watchlistContainer.prepend(watchlistItem);
        });
    }

    // Function to remove a movie from local storage
    function removeMovieFromLocalStorage(imdbID) {
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        // Find the index of the movie in the watchlist array
        const index = watchlist.findIndex(movie => movie.imdbID === imdbID);

        // If the movie is found, remove it from the watchlist array
        if (index !== -1) {
            watchlist.splice(index, 1);
            // Update the local storage with the modified watchlist
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            // Update the clear history button visibility
            updateClearHistoryButtonVisibility();
        }
    }

    // Function to remove a movie from the watchlist
    function removeFromWatchlist(imdbID) {
        // Remove the movie from local storage
        removeMovieFromLocalStorage(imdbID);

        // Remove the movie display from the DOM
        const watchlistItem = $('.watchlist-item').filter(function () {
            return $(this).find('.movie-info-button').data('imdbID') === imdbID;
        });
        watchlistItem.remove();

        // Update the clear history button visibility
        updateClearHistoryButtonVisibility();
    }

    // Function to update the visibility of the clear history button based on local storage
    function updateClearHistoryButtonVisibility() {
        // Retrieve existing watchlist from local storage
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

        // Check if there are items in the watchlist
        if (watchlist.length > 0) {
            // If there are items, display the button
            $('#clear-history-button').css('display', 'block');
        } else {
            // If there are no items, hide the button
            $('#clear-history-button').css('display', 'none');
        }
    }

    // Function to get trailer from kinocheck API
    function fetchKinoCheckTrailer(imdbID,title) {
        const kinoCheckURL = 'https://api.kinocheck.de/movies?imdb_id=' + imdbID + '&language=en';
        console.log(kinoCheckURL);

        const trailerSection = $('#movie-trailer');

        // Clear previous trailer content
        trailerSection.html('');

        // Fetch movie details from KinoCheck
        fetch(kinoCheckURL)

            .then(function (response) {
                // Check if the response is successful
                if (!response.ok) {
                    console.log('Network response was not ok');
                }
                return response.json();
            })
            .then(function (data) {
                // Check if data.trailer is null
                if (data.trailer === null) {
                    console.log('No trailer available from kinocheck');
                }

                // Check if the data contains a trailer object with youtube_video_id
                if (data.trailer && data.trailer.youtube_video_id) {
                    const youtubeVideoId = data.trailer.youtube_video_id;

                    // Embed the YouTube video
                    const embedCode = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + youtubeVideoId + '" frameborder="0" allowfullscreen></iframe>';
                    trailerSection.html(embedCode);
                }
            })
            // If no trailer can be found, display message
            .catch(function (error) {
                console.log('Fetch error:', error);
                trailerSection.html('<p>Sorry no trailer is available for this film through the Kinocheck API - please try elsewhere! <br>For example: <a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(title) + '" target="_blank">www.youtube.com</a></p>');
            });
    }

    // Populate watchlist from local storage on page load
    populateWatchlistFromLocalStorage();

    // Initial check on page load
    updateClearHistoryButtonVisibility();


    // Event listener for save to watchlist button 
    $('#save-to-watchlist').on('click', function (event) {
        event.preventDefault();
        const movieTitle = $('#movie-title').text();
        const imdbID = $('#imdbID').text();

        // Check if a button with the same imdbID already exists
        const existingButton = $('.watchlist-item').filter(function () {
            return $(this).find('.movie-info-button').data('imdbID') === imdbID;
        });

        if (!existingButton.length) {
            const watchlistItem = $('<div>')
                .addClass('watchlist-item')
                .append(
                    $('<button>')
                        .addClass('btn btn-secondary movie-info-button')
                        .text(movieTitle)
                        .data('imdbID', imdbID)
                        .on('click', function () {
                            getMovieDetails(imdbID);
                        }),
                    $('<button>')
                        .addClass('btn btn-danger close-button')
                        .text('X')
                        .on('click', function (event) {
                            // Prevents the click event from triggering on the movie info button
                            event.stopPropagation();
                            // Remove the movie from local storage
                            removeMovieFromLocalStorage(imdbID);
                            // Remove the movie display from the DOM
                            $(this).parent('.watchlist-item').remove();
                        })
                );

            // Append the watchlist item to the watchlist container
            watchlistContainer.prepend(watchlistItem);

            // Save the movie to the watchlist in local storage
            saveToWatchlist({ imdbID: imdbID, title: movieTitle });
            updateClearHistoryButtonVisibility();
        } else {
            // Show the modal if the film is already in the watchlist
            showDuplicateFilmModal();
        }
    });

    // Event listener for close button on watchlist item
    watchlistContainer.on('click', '.close-button', function (event) {
        event.stopPropagation(); // Prevents the click event from triggering on the movie info button
        const imdbID = $(this).siblings('.movie-info-button').data('imdbID');
        // Remove the movie from the watchlist
        removeFromWatchlist(imdbID);

        // Update the clear history button visibility
        updateClearHistoryButtonVisibility();
    });

    // Event listener for clear history button
    $('#clear-history-button').on('click', function () {
        // Clear local storage
        localStorage.clear();

        // Clear the watchlist container
        watchlistContainer.empty();

        // Update the clear history button visibility
        updateClearHistoryButtonVisibility();
    });

});