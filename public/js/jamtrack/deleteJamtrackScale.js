const jamtrackScaleDelete = async(event) => {
    const url = 'https://localhost:8000/jamtrack/deleteScale/';
    const jamtrackId = document.getElementById('jamtrackScaleDeleteId').value;
    const scaleId = document.getElementById('scaleDeleteId').value;

    if(!jamtrackId || !scaleId){
        alert('Fill jamtrack id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + jamtrackId + '/' + scaleId, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteJamtrackScaleStatus').innerText = response.status;
    document.getElementById('deleteJamtrackScaleResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteJamtrackScaleForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteJamtrackScale').addEventListener('click', jamtrackScaleDelete);
});