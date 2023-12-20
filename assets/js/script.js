
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




  