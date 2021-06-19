const jamtrackTimesignatureAdd = async(event) => {
    const url = 'https://localhost:8000/jamtrack/addTimesignatureRelation/';
    const jamtrackId = document.getElementById('jamtrackTimeSignatureAddId').value;
    const timesignatureId = document.getElementById('timeSignatureAddId').value;

    if(!jamtrackId || !timesignatureId){
        alert('Fill jamtrack and Timesignature id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            timeSignatureId: timesignatureId,
            jamtrackId: jamtrackId
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('addJamtrackTimeSignatureStatus').innerText = response.status;
    document.getElementById('addJamtrackTimeSignatureResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('addJamtrackTimeSignatureForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitAddJamtrackTimeSignature').addEventListener('click', jamtrackTimesignatureAdd);
});