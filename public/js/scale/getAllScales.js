const getAllScales = async(event) => {
    const url = 'https://localhost:8000/scale/getall';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllScalesStatus').innerText = response.status;
    document.getElementById('getAllScalesResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllScale').addEventListener('click', getAllScales);
});