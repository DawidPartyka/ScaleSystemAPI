const getTimeSignatureById = async(event) => {
    const url = 'https://localhost:8000/TimeSignature/getbyid/';
    const id = document.getElementById('timeSignatureById').value;

    if(!id){
        alert('Fill id field before sending the request');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getTimeSignatureByIdStatus').innerText = response.status;
    document.getElementById('getTimeSignatureByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('getTimeSignatureByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitGetTimeSignatureById').addEventListener('click', getTimeSignatureById);
});