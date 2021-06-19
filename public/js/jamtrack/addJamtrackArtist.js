const jamtrackArtistAdd = async(event) => {
    const url = 'https://localhost:8000/jamtrack/addArtistRelation/';
    const jamtrackId = document.getElementById('jamtrackArtistAddId').value;
    const artistId = document.getElementById('artistAddId').value;

    if(!jamtrackId || !artistId){
        alert('Fill jamtrack and artist id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            artistId: artistId,
            jamtrackId: jamtrackId
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('addJamtrackArtistStatus').innerText = response.status;
    document.getElementById('addJamtrackArtistResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('addJamtrackArtistForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitAddJamtrackArtist').addEventListener('click', jamtrackArtistAdd);
});