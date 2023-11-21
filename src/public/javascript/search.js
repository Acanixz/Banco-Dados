
function clearSearchResults() {
    const resultContainer = document.getElementById("resultContainer")
    const children = resultContainer.children;

    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.id !== "resultsTitle" && child.id !== "pagination") {
            resultContainer.removeChild(child);
        }
    }
}

function clearFilters() {
    document.getElementById("IDInput").value = "";
    document.getElementById("nameInput").value = "";

    const genreContainer = document.getElementById("genreContainer");
    for (const element of genreContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        element.lastElementChild.checked = false;
    }

    const categoryContainer = document.getElementById("categoryContainer");
    for (const element of categoryContainer.children) {
        if (!element.classList.contains("formInput")) {continue};
        element.lastElementChild.checked = false;
    }
    
    search();
}

function updatePagination(value) {
    const currentPageBtn = document.getElementById("currentPageBtn")
    currentPageBtn.textContent = parseInt(currentPageBtn.textContent, 10) + value;

    const prevPageBtn = document.getElementById("prevPageBtn");
    if (parseInt(currentPageBtn.textContent, 10) > 1){
        prevPageBtn.disabled = false;
    } else {
        prevPageBtn.disabled = true;
    }
    search();
}

function paginationUpdated(params) {
    search();
}

function pageRedirect(targetURL) {
    window.location.href = targetURL;
}

function search(eventParams = null) {
    if (eventParams){
        eventParams.preventDefault();
        document.getElementById("currentPageBtn").textContent = "1";
    }
    clearSearchResults();
    let requestURL = "http://localhost:3000/api/data?hasParams=true"

    const targetID = document.getElementById("IDInput").value;

    console.log(targetID)
    if (targetID == ""){
        const targetName = encodeURIComponent(document.getElementById("nameInput").value);

        if (targetName != ""){
            requestURL += `&name=${encodeURIComponent(targetName)}`;
        }
        
        const genreContainer = document.getElementById("genreContainer");
        for (const element of genreContainer.children) {
            if (!element.classList.contains("formInput")) {continue};
            if (element.lastElementChild.checked){
                requestURL += `&genres=${element.firstElementChild.textContent}`;
                console.log(`&genres=${element.firstElementChild.textContent}`)
            }
        }

        const categoryContainer = document.getElementById("categoryContainer");
        for (const element of categoryContainer.children) {
            if (!element.classList.contains("formInput")) {continue};
            if (element.lastElementChild.checked){
                requestURL += `&categories=${element.firstElementChild.textContent}`;
                console.log(`&categories=${element.firstElementChild.textContent}`)
            }
        }


    } else {
        requestURL += `&id=${encodeURIComponent(targetID)}`;
    }

    requestURL += `&page=${document.getElementById("currentPageBtn").textContent}&pageSize=${document.getElementById("paginationLimit").value}`

    fetch(requestURL)
        .then(response => response.json())
        .then(data => {
            const resultContainer = document.getElementById('resultContainer');

            // Nenhum Resultado
            if (Object.keys(data).length == 0) {
                const textElement = document.createElement('span');
                textElement.textContent = "No results found!"
                resultContainer.appendChild(textElement)
            }

            // Resultado encontrado
            data.forEach(gameData => {
                const gameDiv = document.createElement('div');
                gameDiv.classList.add("gameResult")
                gameDiv.onclick = () => {
                    pageRedirect(`http://localhost:3000/games/${gameData["idJogo"]}`);
                }

                const gameID = document.createElement('span');
                gameID.textContent = gameData["idJogo"];
                gameDiv.appendChild(gameID);

                const gameName = document.createElement('span');
                gameName.textContent = gameData["nomeJogo"];
                gameName.classList.add("resultGameName")
                gameDiv.appendChild(gameName);

                const gamePrice = document.createElement('span');
                if (gameData["preco"] > 0){
                    gamePrice.textContent = `$${gameData["preco"]}`;
                } else {
                    gamePrice.textContent = `Free`
                }
                gameDiv.appendChild(gamePrice);

                if (gameData["Windows"] || gameData["Linux"] || gameData["macOS"]){
                    const osIconsDiv = document.createElement('div');
                    osIconsDiv.style.display = 'inline';
                    osIconsDiv.className = 'osIcons';

                    if (gameData["Windows"]){
                        const windowsIcon = document.createElement('img');
                        windowsIcon.style.filter = 'invert(1)';
                        windowsIcon.src = 'svg/windows.svg';
                        windowsIcon.width = 16;
                        windowsIcon.height = 16;
                        windowsIcon.alt = 'Windows support';
                        osIconsDiv.appendChild(windowsIcon);
                    }

                    if (gameData["Linux"]){
                        const linuxIcon = document.createElement('img');
                        linuxIcon.style.filter = 'invert(1)';
                        linuxIcon.src = 'svg/linux.svg';
                        linuxIcon.width = 16;
                        linuxIcon.height = 16;
                        linuxIcon.alt = 'Linux support';
                        osIconsDiv.appendChild(linuxIcon);
                    }

                    if (gameData["macOS"]){
                        const macOSIcon = document.createElement('img');
                        macOSIcon.style.filter = 'invert(1)';
                        macOSIcon.src = 'svg/macOS.svg';
                        macOSIcon.width = 16;
                        macOSIcon.height = 16;
                        macOSIcon.alt = 'macOS support';
                        osIconsDiv.appendChild(macOSIcon);
                    }

                    gameDiv.appendChild(osIconsDiv)
                }

                resultContainer.appendChild(gameDiv);
            });
        })
        .catch(error => {
            console.error(error);
        })
}

function main() {
    createGenres();
    createCategories();
    clearSearchResults();
    search();
}
main();