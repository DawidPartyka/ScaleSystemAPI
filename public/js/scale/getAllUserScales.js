const getAllUserScales = async(event) => {
    const url = 'https://localhost:8000/scale/getalluserscales';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllUserScalesStatus').innerText = response.status;
    document.getElementById('getAllUserScalesResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllUserScale').addEventListener('click', getAllUserScales);
});