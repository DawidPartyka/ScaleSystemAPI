const deleteScaleById = async(event) => {
    const url = 'https://localhost:8000/scale/deletebyid/';

    event.preventDefault();

    const id = document.getElementById('deleteScaleById').value;

    if(!id){
        alert('Fill scale id before sending');

        return;
    }

    const rawResponse = await fetch(url + id, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteIdScaleStatus').innerText = response.status;
    document.getElementById('deleteIdScaleFormResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteScaleByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteIdScale').addEventListener('click', deleteScaleById);
});