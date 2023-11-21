function getGameIDFromURL() {
    var pathArray = window.location.pathname.split('/');
    var gamesIndex = pathArray.indexOf('games');
    return pathArray[gamesIndex + 1];
}

function formatReleaseDate(dateString) {
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getGameData() {
    var gameID = getGameIDFromURL();

    if (gameID < 0){
        alert("Please select a valid game ID");
        return;
    }

    fetch(`http://localhost:3000/api/data/${gameID}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (Array.isArray(data)) {
            if (data.length === 0){
                alert(`Game with id ${gameID} not found!`)
                window.location.href = "/search"
                return;
            }
            data = data[0];
            console.log('GET request succeeded:', data);
            
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var element = document.getElementById(key);
                    if (element) {
                        if (key === 'dataLancamento') {
                            element.textContent = formatReleaseDate(data[key]);
                        } else if (key === 'quantRecomendacoes') {
                            element.textContent = data[key];
                            var positivePercentage = (data[key] / data.quantReviews * 100).toFixed(2);
                            document.getElementById('quantRecomendacoes').textContent = `${element.textContent} (${positivePercentage}%)`;
                        } else if (key == 'Windows' || key=='Linux' ||key == 'macOS') {
                            let osKeyResult = data[key] ? 'inline' : 'none';
                            element.style.display = osKeyResult
                        } else {
                            element.textContent = data[key];
                        }
                    }
                }
            }
            
            fetch(`http://localhost:3000/api/data/${gameID}/genres`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    data.forEach(genre => {
                        const genreContainer = document.getElementById("genreContainer");
                        for (const element of genreContainer.children) {
                            if (!element.classList.contains("formInput")) {continue};
                            
                            // Reset state of all elements
                            element.lastElementChild.checked = false;
                            element.setAttribute("originalState", 0);

                            // Then check if it's true in the database
                            if (element.firstElementChild.textContent == genre.nomeGenero){
                                element.lastElementChild.checked = true;
                                element.setAttribute("originalState", 1);
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error during GET request:', error);
                alert("Could not get game's genre data, check console for errors")
            });

            fetch(`http://localhost:3000/api/data/${gameID}/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    data.forEach(category => {
                        const categoryContainer = document.getElementById("categoryContainer");
                        for (const element of categoryContainer.children) {
                            if (!element.classList.contains("formInput")) {continue};
                            
                            // Reset state of all elements
                            element.lastElementChild.checked = false;
                            element.setAttribute("originalState", 0);

                            // Then check if it's true in the database
                            if (element.firstElementChild.textContent == category.nomeCategoria){
                                element.lastElementChild.checked = true;
                                element.setAttribute("originalState", 1);
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error during GET request:', error);
                alert("Could not get game's category data, check console for errors")
            });
        }
    })
    .catch(error => {
        console.error('Error during GET request:', error);
        alert("Could not get game data, check console for errors")
    });
}


function main() {
    createCategories(true);
    createGenres(true);
    getGameData();
}
main();