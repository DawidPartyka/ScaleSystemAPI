const updateTimeSignature = async(event) => {
    const url = 'https://localhost:8000/TimeSignature/update';

    const id = document.getElementById('updateTimeSignature').value;
    const name = document.getElementById('updateTimeSignatureName').value;

    if(!name || !id){
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
            name: name
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('updateTimeSignatureByIdStatus').innerText = response.status;
    document.getElementById('updateTimeSignatureByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('updateTimeSignatureByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitUpdateTimeSignatureById').addEventListener('click', updateTimeSignature);
});