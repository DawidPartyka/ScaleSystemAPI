const postScale = async(event) => {
    const name = document.getElementById('scaleName').value;
    const tonic = document.getElementById('scaleTonicOption').value;
    const feature = document.getElementById('featured').checked;
    const soundArr = [];

    for(let i = 0; i < 12; i++){
        soundArr.push(document.getElementById(`sound${i}`).checked);
    }

    if(!soundArr.length === 12 || soundArr.every(x => x === false) || !tonic || !name){
        alert('Fill all required information fields please');
        return;
    }

    event.preventDefault();

    //F G# A# C D#
    const rawResponse = await fetch('https://localhost:8000/scale/addScale', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            scale: soundArr,
            name: name,
            tonic: tonic,
            featured: feature
        })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    document.getElementById('addScaleStatus').innerText = response.status;
    document.getElementById('addScaleFormResponse').innerText = JSON.stringify(jsonResponse, null, 2);
    document.getElementById('addScaleForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitScale').addEventListener('click', postScale);
});