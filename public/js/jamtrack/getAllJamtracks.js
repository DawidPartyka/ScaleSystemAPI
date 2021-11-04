const getAllJamtracks = async(event) => {
    const url = 'https://localhost:8000/jamtrack/getallraw';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllJamtracksStatus').innerText = response.status;
    document.getElementById('getAllJamtracksResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllJamtracks').addEventListener('click', getAllJamtracks);
});