const deleteGenre = async(event) => {
    const url = 'https://localhost:8000/genre/delete/';
    const id = document.getElementById('deleteGenre').value;

    if(!id){
        alert('Fill scale id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteGenreByIdStatus').innerText = response.status;
    document.getElementById('deleteGenreByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteGenreByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteGenreById').addEventListener('click', deleteGenre);
});