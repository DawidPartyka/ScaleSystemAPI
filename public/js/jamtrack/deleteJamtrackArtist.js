const jamtrackArtistDelete = async(event) => {
    const url = 'https://localhost:8000/jamtrack/deleteArtist/';
    const jamtrackId = document.getElementById('jamtrackArtistDeleteId').value;
    const artistId = document.getElementById('artistDeleteId').value;

    if(!jamtrackId || !artistId){
        alert('Fill jamtrack id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + jamtrackId + '/' + artistId, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteJamtrackArtistStatus').innerText = response.status;
    document.getElementById('deleteJamtrackArtistResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteJamtrackArtistForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteJamtrackArtist').addEventListener('click', jamtrackArtistDelete);
});