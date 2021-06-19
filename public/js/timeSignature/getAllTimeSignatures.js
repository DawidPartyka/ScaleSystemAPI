const getAllTimeSignatures = async(event) => {
    const url = 'https://localhost:8000/TimeSignature/getall';

    event.preventDefault();

    const rawResponse = await fetch(url);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getAllTimeSignaturesStatus').innerText = response.status;
    document.getElementById('getAllTimeSignaturesResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitGetAllTimeSignatures').addEventListener('click', getAllTimeSignatures);
});