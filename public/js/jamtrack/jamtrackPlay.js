const streamUrl = 'https://localhost:8000/jamtrack/filestream/';
let audio;
const play = (id) => {
    const url = streamUrl + id;

    // Prepares for audio change if ones currently playing
    if(audio){
        //audio.pause();
        audio.src = url;
        /*audio.load();
        audio.play();
        audio.play();*/
        //console.log('if')
    }

    else{
        const cont = document.getElementById('audioContainer');
        const desc = document.getElementById('description');

        audio = new Audio(url);
        cont.appendChild(audio);
        audio.setAttribute('controls', 'controls');
        audio.setAttribute('controlsList', 'nodownload');

        const description = document.createElement('small');
        desc.appendChild(description);
        description.setAttribute('class', 'text-info float-left');
        description.innerText = 'If audio doesn\'t start playing try pressing play button again';
    }

    audio.addEventListener('loadeddata', () => {
        //console.log('listen');
        if(audio.readyState >= 2)
            audio.play();
    });
}