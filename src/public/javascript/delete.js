function deleteGame(event) {
    event.preventDefault();

    var gameID = parseInt(document.getElementById('gameIDInput').value);
    fetch(`http://localhost:3000/api/data/${gameID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('DELETE request succeeded:', data);
        alert(data.message);
        window.location.href = "http://localhost:3000/search";
    })
    .catch(error => {
        console.error('Error during DELETE request:', error);
        alert("Game deletion failed! Check logs for information");
    });
}