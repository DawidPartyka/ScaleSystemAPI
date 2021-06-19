const addArtist = async(event) => {
    const url = 'https://localhost:8000/artist/create';

    const name = document.getElementById('createArtist').value;

    if(!name){
        alert('Fill form data before sending');
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
            name: name
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('createArtistStatus').innerText = response.status;
    document.getElementById('createArtistResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitCreateArtist').addEventListener('click', addArtist);
});