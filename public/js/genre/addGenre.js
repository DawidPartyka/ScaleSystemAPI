const addGenre = async(event) => {
    const url = 'https://localhost:8000/genre/create';

    const name = document.getElementById('createGenre').value;

    if(!name){
        alert('Fill form data before sending');
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
            name: name
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('createGenreStatus').innerText = response.status;
    document.getElementById('createGenreResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitCreateGenre').addEventListener('click', addGenre);
});