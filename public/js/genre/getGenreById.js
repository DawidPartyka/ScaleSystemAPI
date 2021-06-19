const getGenreByid = async(event) => {
    const url = 'https://localhost:8000/genre/getbyid/';
    const id = document.getElementById('GenreById').value;

    if(!id){
        alert('Fill id field before sending the request');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getGenreByIdStatus').innerText = response.status;
    document.getElementById('getGenreByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('getGenreByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitGetGenreById').addEventListener('click', getGenreByid);
});