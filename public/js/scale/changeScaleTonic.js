const changeScaleTonic = async(event) => {
    const url = 'https://localhost:8000/scale/changescaletonic';
    const tonic = document.getElementById('changeScaleSchemeTonic').value;
    const tonicTarget = document.getElementById('changeScaleSchemeTonicTarget').value;
    const soundArr = [];

    for(let i = 0; i < 12; i++){
        soundArr.push(document.getElementById(`soundChangeScaleScheme${i}`).checked);
    }

    if(!tonic || !tonicTarget || soundArr.every(x => x === false)){
        alert('Fill scale data to perform tonic shift before sending');
        return;
    }

    event.preventDefault();

    const sounds = soundArr.map(x => x ? 1 : 0).join('');

    const readyUrl = [url, tonic, tonicTarget, sounds].join('/');

    const rawResponse = await fetch(readyUrl);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('scaleChangeSchemeStatus').innerText = response.status;
    document.getElementById('scaleChangeSchemeFormResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('changeScaleSchemeForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitChangeScaleScheme').addEventListener('click', changeScaleTonic);
});