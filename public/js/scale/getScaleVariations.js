const getScaleVariations = async(event) => {
    const soundArr = [];
    const url = 'https://localhost:8000/scale/scaleVariations/';

    for(let i = 0; i < 12; i++){
        soundArr.push(document.getElementById(`soundVariation${i}`).checked);
    }

    if(!soundArr.length === 12 || soundArr.every(x => x === false)){
        alert('Fill all required information fields please');
        return;
    }

   const readyUrl = url + soundArr.reduce((all, cur) => {
        return all + (cur ? '1' : '0');
    }, '');

    event.preventDefault();

    const rawResponse = await fetch(readyUrl);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('scaleVariationsStatus').innerText = response.status;
    document.getElementById('scaleVariationsResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('scaleVariationForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitScaleVariation').addEventListener('click', getScaleVariations);
});