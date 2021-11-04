const getAllArtists = async(event) => {
    const url = 'https://localhost:8000/artist/getall';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllArtistsStatus').innerText = response.status;
    document.getElementById('getAllArtistsResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllArtists').addEventListener('click', getAllArtists);
});