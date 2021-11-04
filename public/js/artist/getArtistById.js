const getArtistByid = async(event) => {
    const url = 'https://localhost:8000/artist/getbyid/';
    const id = document.getElementById('artistById').value;

    if(!id){
        alert('Fill id field before sending the request');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getArtistByIdStatus').innerText = response.status;
    document.getElementById('getArtistByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('getArtistByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitGetArtistById').addEventListener('click', getArtistByid);
});