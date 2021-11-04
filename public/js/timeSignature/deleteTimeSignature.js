const deleteTimeSignature = async(event) => {
    const url = 'https://localhost:8000/TimeSignature/delete/';
    const id = document.getElementById('deleteTimeSignature').value;

    if(!id){
        alert('Fill scale id before sending');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('deleteTimeSignatureByIdStatus').innerText = response.status;
    document.getElementById('deleteTimeSignatureByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('deleteTimeSignatureByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitDeleteTimeSignatureById').addEventListener('click', deleteTimeSignature);
});