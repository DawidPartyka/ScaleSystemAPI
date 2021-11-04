const updateScale = async(event) => {
    const url = 'https://localhost:8000/scale/update';
    const id = document.getElementById('updateScaleId').value;
    const tonic = document.getElementById('updateScaleTonic').value;
    const name = document.getElementById('updateScaleName').value;
    const soundArr = [];

    for(let i = 0; i < 12; i++){
        soundArr.push(document.getElementById(`soundUpdate${i}`).checked);
    }

    if(!id || (tonic === 'None' && !name && soundArr.every(x => x === false) && !name)){
        alert('Fill scale data to perform update before sending');
        return;
    }

    const patchObj = {
        scaleId: id,
        data: {}
    }

    if(tonic !== 'None')
        patchObj.data.tonic = tonic;

    if(!soundArr.every(x => x === false))
        patchObj.data.sounds = soundArr;

    if(name)
        patchObj.data.name = name;

    event.preventDefault();

    const rawResponse = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patchObj)
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('updateScaleStatus').innerText = response.status;
    document.getElementById('updateScaleFormResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('updateScaleForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitUpdateScale').addEventListener('click', updateScale);
});