const updateJamtrack = async(event) => {
    const url = 'https://localhost:8000/jamtrack/update';

    const id = document.getElementById('jamtrackUpdateId').value;
    const name = document.getElementById('jamtrackUpdateName').value;
    const genre = document.getElementById('jamtrackUpdateGenre').value;
    const bpm = document.getElementById('jamtrackUpdateBPM').value;

    if(!id || !name && !genre && !bpm){
        alert('Fill form data before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            name: name,
            genreId: genre,
            bpm: bpm
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('updateJamtrackStatus').innerText = response.status;
    document.getElementById('updateJamtrackResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('updateJamtrackForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitUpdateJamtrack').addEventListener('click', updateJamtrack);
});