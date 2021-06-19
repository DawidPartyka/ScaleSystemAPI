const updateGenre = async(event) => {
    const url = 'https://localhost:8000/genre/update';

    const id = document.getElementById('updateGenre').value;
    const name = document.getElementById('updateGenreName').value;

    if(!name || !id){
        alert('Fill form data before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            name: name
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('updateGenreByIdStatus').innerText = response.status;
    document.getElementById('updateGenreByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('updateGenreByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitUpdateGenreById').addEventListener('click', updateGenre);
});