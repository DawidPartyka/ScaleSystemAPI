const addTimeSignature = async(event) => {
    const url = 'https://localhost:8000/TimeSignature/create';

    const name = document.getElementById('createTimeSignature').value;

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

    document.getElementById('createTimeSignatureStatus').innerText = response.status;
    document.getElementById('createTimeSignatureResponse').innerText = JSON.stringify(jsonResponse, null, 2);
}

window.addEventListener('load', () => {
    document.getElementById('submitCreateTimeSignature').addEventListener('click', addTimeSignature);
});