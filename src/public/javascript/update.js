function resetForm() {
    // Form inputs
    document.getElementById("gameIDInput").value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('priceInput').value = '0';

    // Platform checkboxes
    document.getElementById('windowsCheckbox').checked = false;
    document.getElementById('linuxCheckbox').checked = false;
    document.getElementById('macOSCheckbox').checked = false;

    // External Reviews input
    document.getElementById('metacriticInput').value = '0';

    // Game Resources inputs
    document.getElementById('DLCInput').value = '0';
    document.getElementById('demoInput').value = '0';
    document.getElementById('achievementInput').value = '0';
}

function getGameData(event) {
    event.preventDefault();
    var gameID = parseInt(document.getElementById('gameIDInput').value);
    
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
                return;
            }
            data = data[0];
            console.log('GET request succeeded:', data);
            
            document.getElementById('nameInput').value = data.nomeJogo;
            document.getElementById('descriptionInput').value = data.descricao;
            document.getElementById('priceInput').value = data.preco;
            document.getElementById('ageInput').value = data.faixaEtaria;

            document.getElementById('dateInput').value = new Date(data.dataLancamento).toISOString().split('T')[0];
            
            document.getElementById('windowsCheckbox').checked = data.Windows;
            document.getElementById('linuxCheckbox').checked = data.Linux;
            document.getElementById('macOSCheckbox').checked = data.macOS;
        
            document.getElementById('metacriticInput').value = data.metacritic;
        
            document.getElementById('DLCInput').value = data.quantDLCs;
            document.getElementById('demoInput').value = data.quantDemos;
            document.getElementById('achievementInput').value = data.quantConquistas;
            
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

            document.getElementById("getDataBtn").setAttribute("dataAdquired", "1");
        }
    })
    .catch(error => {
        console.error('Error during GET request:', error);
        alert("Could not get game data, check console for errors")
    });
}

function idChanged() {
    document.getElementById("getDataBtn").setAttribute("dataAdquired", "0");
}

function updateGame(event) {
    event.preventDefault();

    var gameID = parseInt(document.getElementById('gameIDInput').value);

    if (parseInt(document.getElementById("getDataBtn").getAttribute("dataAdquired")) == false){
        alert("Please get the game data first, THEN update it before uploading");
        return;
    }

    if (gameID < 0){
        alert("Please select a valid game ID")
        return;
    }

    var nameValue = document.getElementById('nameInput').value;
    var descriptionValue = document.getElementById('descriptionInput').value;
    var priceValue = parseFloat(document.getElementById('priceInput').value);
    var ageValue = parseInt(document.getElementById('ageInput').value)

    var originalDateValue = document.getElementById('dateInput').value;
    var dateValue = new Date(originalDateValue);

    if (isNaN(dateValue.getTime())) {
        alert("Please insert a valid release date")
        return;
    }
    dateValue = formatDate(dateValue);


    // Platform values
    var windowsValue = document.getElementById('windowsCheckbox').checked ? 1 : 0;
    var linuxValue = document.getElementById('linuxCheckbox').checked ? 1 : 0;
    var macOSValue = document.getElementById('macOSCheckbox').checked ? 1 : 0;

    // External Reviews values
    var metacriticValue = parseInt(document.getElementById('metacriticInput').value);

    // Game Resources values
    var dlcCountValue = parseInt(document.getElementById('DLCInput').value);
    var demoCountValue = parseInt(document.getElementById('demoInput').value);
    var achievementCountValue = parseInt(document.getElementById('achievementInput').value);

    if (nameValue == ""){
        alert("Please insert a name for your game")
        return
    }

    if (priceValue < 0){
        alert("Invalid price value")
    }

    let requestedGenres = []
    let deletedGenres = []

    const genreContainer = document.getElementById("genreContainer");
    for (const element of genreContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        if (element.lastElementChild.checked && !parseInt(element.getAttribute("originalState"))){
            requestedGenres.push(parseInt(element.lastElementChild.getAttribute('database_id')))
        }

        if (!element.lastElementChild.checked && parseInt(element.getAttribute("originalState"))){
            deletedGenres.push(parseInt(element.lastElementChild.getAttribute('database_id')))
        }
    }

    let requestedCategories = []
    let deletedCategories = []

    const categoryContainer = document.getElementById("categoryContainer");
    for (const element of categoryContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        if (element.lastElementChild.checked && !parseInt(element.getAttribute("originalState"))){
            requestedCategories.push(parseInt(element.lastElementChild.getAttribute('database_id')))
        }

        if (!element.lastElementChild.checked && parseInt(element.getAttribute("originalState"))){
            deletedCategories.push(parseInt(element.lastElementChild.getAttribute('database_id')))
        }
    }

    let requestBody = {
        "main": {
            "nomeJogo": nameValue,
            "descricao": descriptionValue,
            "preco": priceValue,
            "faixaEtaria": ageValue,
            "dataLancamento": dateValue
        },
        "avaliacao": {
            "metacritic": metacriticValue
        },
        "plataforma": {
            "Windows": windowsValue,
            "Linux": linuxValue,
            "macOS": macOSValue,
        },
        "recurso": {
            "quantDLCs": dlcCountValue,
            "quantDemos": demoCountValue,
            "quantConquistas": achievementCountValue,
        },
        "categoria": {
            "ADD": requestedCategories,
            "REMOVE": deletedCategories
        },
        "genero": {
            "ADD": requestedGenres,
            "REMOVE": deletedGenres
        }
    };

    console.log(requestBody)
    fetch(`http://localhost:3000/api/data/${gameID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('PUT request succeeded:', data);
        alert(data.message);
        // TODO: Redirect to game's page once that's completed
        window.location.href = "http://localhost:3000/search"
    })
    .catch(error => {
        console.error('Error during PUT request:', error);
        alert("Game update failed! check logs for information")
    });
}

function main() {
    createCategories();
    createGenres();
}

main();