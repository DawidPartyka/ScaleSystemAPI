const getScaleById = async(event) => {
    const url = 'https://localhost:8000/scale/getbyid/';

    event.preventDefault();

    const id = document.getElementById('scaleById').value;

    if(!id){
        alert('Fill scale id before sending');

        return;
    }

    const rawResponse = await fetch(url + id);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getIdScaleStatus').innerText = response.status;
    document.getElementById('getIdScaleFormResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('getScaleByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitGetIdScale').addEventListener('click', getScaleById);
});