function formatDate(date) {
    const isoString = date.toISOString();
    return isoString.split('T')[0];
}

function createGenres(disabledElement = false) {
    fetch('http://localhost:3000/api/genres')
        .then(response => response.json())
        .then(data => {
            const genreContainer = document.getElementById('genreContainer');

            data.forEach(genre => {
                const genreDiv = document.createElement('div');
                genreDiv.classList.add('formInput');
                genreDiv.setAttribute("originalState", "0"); // Used for updating

                const label = document.createElement('label');
                label.setAttribute('for', genre.nomeGenero);
                label.textContent = genre.nomeGenero;

                const input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                input.setAttribute('name', genre.nomeGenero);
                input.setAttribute('database_id', genre.idGenero);
                input.setAttribute('id', `gen_${genre.idGenero}`);
                input.disabled = disabledElement

                genreDiv.appendChild(label);
                genreDiv.appendChild(input);

                genreContainer.appendChild(genreDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching genres:', error);
        });
}

function createCategories(disabledElement = true) {
    fetch('http://localhost:3000/api/categories')
        .then(response => response.json())
        .then(data => {
            const categoryContainer = document.getElementById('categoryContainer');

            data.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.classList.add('formInput');
                categoryDiv.setAttribute("originalState", "0"); // Used for updating

                const label = document.createElement('label');
                label.setAttribute('for', category.nomeCategoria);
                label.textContent = category.nomeCategoria;

                const input = document.createElement('input');
                input.setAttribute('type', 'checkbox');
                input.setAttribute('name', category.nomeCategoria);
                input.setAttribute('database_id', category.idCategoria);
                input.setAttribute('id', `cat_${category.idCategoria}`);
                input.disabled = disabledElement

                categoryDiv.appendChild(label);
                categoryDiv.appendChild(input);

                categoryContainer.appendChild(categoryDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}