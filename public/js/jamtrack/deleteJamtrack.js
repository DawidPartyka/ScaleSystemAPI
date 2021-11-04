const jamtrackDelete = async(event) => {
    const url = 'https://localhost:8000/jamtrack/delete/';
    const id = document.getElementById('jamtrackDeleteId').value;

    if(!id){
        alert('Fill jamtrack id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteJamtrackStatus').innerText = response.status;
    document.getElementById('deleteJamtrackResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteJamtrackForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteJamtrack').addEventListener('click', jamtrackDelete);
});