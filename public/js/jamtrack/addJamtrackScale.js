const jamtrackScaleAdd = async(event) => {
    const url = 'https://localhost:8000/jamtrack/addScaleRelation/';
    const jamtrackId = document.getElementById('jamtrackScaleAddId').value;
    const scaleId = document.getElementById('scaleAddId').value;
    const timestamps = document.getElementById('scaleAddTimeStamps').value;
    const tonic = document.getElementById('addScaleSchemeTonic').value;

    if(!jamtrackId || !scaleId || !timestamps || !tonic){
        alert('Fill jamtrack and Scale id before sending');
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
            scaleId: scaleId,
            jamtrackId: jamtrackId,
            scaleTimeStamp: timestamps.split(' '),
            tonic: tonic
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('addJamtrackScaleStatus').innerText = response.status;
    document.getElementById('addJamtrackScaleResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('addJamtrackScaleForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitAddJamtrackScale').addEventListener('click', jamtrackScaleAdd);
});