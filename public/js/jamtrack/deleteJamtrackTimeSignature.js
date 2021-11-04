const jamtrackTimeSignatureDelete = async(event) => {
    const url = 'https://localhost:8000/jamtrack/deleteTimeSignature/';
    const jamtrackId = document.getElementById('jamtrackTimeSignatureDeleteId').value;
    const timeSignatureId = document.getElementById('timeSignatureDeleteId').value;

    if(!jamtrackId || !timeSignatureId){
        alert('Fill jamtrack id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + jamtrackId + '/' + timeSignatureId, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteJamtrackTimeSignatureStatus').innerText = response.status;
    document.getElementById('deleteJamtrackTimeSignatureResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteJamtrackTimeSignatureForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteJamtrackTimeSignature').addEventListener('click', jamtrackTimeSignatureDelete);
});