const getJamtrackByid = async(event) => {
    const url = 'https://localhost:8000/Jamtrack/getbyid/';
    const id = document.getElementById('JamtrackById').value;

    if(!id){
        alert('Fill id field before sending the request');
        return;
    }

    event.preventDefault();

    const rawResponse = await fetch(url + id);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('getJamtrackByIdStatus').innerText = response.status;
    document.getElementById('getJamtrackByIdResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('getJamtrackByIdForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitGetJamtrackById').addEventListener('click', getJamtrackByid);
});