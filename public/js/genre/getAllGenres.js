const getAllGenres = async(event) => {
    const url = 'https://localhost:8000/genre/getall';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllGenresStatus').innerText = response.status;
    document.getElementById('getAllGenresResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllGenres').addEventListener('click', getAllGenres);
});