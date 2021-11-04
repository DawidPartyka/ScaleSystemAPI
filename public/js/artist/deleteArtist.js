const deleteArtist = async(event) => {
    const url = 'https://localhost:8000/artist/delete/';
    const id = document.getElementById('deleteArtist').value;

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

    document.getElementById('deleteArtistByIdStatus').innerText = response.status;
    document.getElementById('deleteArtistByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteArtistByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteArtistById').addEventListener('click', deleteArtist);
});