const updateArtist = async(event) => {
    const url = 'https://localhost:8000/artist/update';

    const id = document.getElementById('updateArtist').value;
    const name = document.getElementById('updateArtistName').value;

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

    document.getElementById('updateArtistByIdStatus').innerText = response.status;
    document.getElementById('updateArtistByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('updateArtistByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitUpdateArtistById').addEventListener('click', updateArtist);
});