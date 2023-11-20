function resetForm() {
    // Form inputs
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

function createGame(event) {
    event.preventDefault();

    // Get values from the form inputs
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

    const genreContainer = document.getElementById("genreContainer");
    for (const element of genreContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        if (element.lastElementChild.checked){
            requestedGenres.push(parseInt(element.lastElementChild.getAttribute('database_id')))
        }
    }

    let requestedCategories = []

    const categoryContainer = document.getElementById("categoryContainer");
    for (const element of categoryContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        if (element.lastElementChild.checked){
            requestedCategories.push(parseInt(element.lastElementChild.getAttribute('database_id')))
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
            "metacritic": metacriticValue,
            "quantReviews": 0,
            "quantRecomendacoes": 0,
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
            "ADD": requestedCategories
        },
        "genero": {
            "ADD": requestedGenres
        }
    };

    console.log(requestBody)
    fetch('http://localhost:3000/api/data/-1', {
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
        alert("Game creation failed! check logs for information")
    });
}

function main() {
    createCategories();
    createGenres();
}

main();