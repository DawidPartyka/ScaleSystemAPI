const failedFetchAlert = 'Something didn\'t went as planned. Please try reloading the site. ' +
    'If the error continues to occur please conntact the administrator';

const sounds = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

const generalData = {
    artists: [],
    genre: null,
    scales: [],
    tonic: [],
    scaleTimestampsField: [],
    timeSignatures: []
}

const getArtists = () => {
    const newArtists = document.getElementById('newArtist').value;
    const artists = newArtists.split('|').map(x => x.trim());

    return newArtists ? generalData.artists.concat(artists) : generalData.artists;
}

const getScaleTimestamps = (target) => {
    const timestamps = target.value;
    const stamps = timestamps.split(' ').map(x => x.trim());

    // Checks if every signature matches pattern of number/number and throws alert if it doesn't
    if(!stamps.every(x => new RegExp(/^\d+(\:\d+)$/).test(x))){
        alert('Timestamps are not correct. Only acceptable format is "number:number".\n' +
            'More than one timestamp can be supplied if distinct values are separated with spaces.');

        return false;
    }

    return stamps;
}

const getScales = () => {
    const newScales = generalData.scales;
    const newTonics = generalData.tonic;
    let flag = true;

    const arrCheck = newScales.map((entry, index) => {
        return {
            scaleId: entry,
            tonic: newTonics[index].value
        };
    });

    const uniqueScales = [...new Set(newScales)];

    // Checks if all pairs { scale, tonic } are unique
    uniqueScales.forEach((entry) => {
        // If one bit of data is incorrect there's no point in checking the rest
        if(!flag)
            return;

        const tonics = [];
        const scalesCheck = arrCheck.filter(x => x.scaleId === entry);
        scalesCheck.forEach(x => tonics.push(x.tonic.value));

        if(!scalesCheck.length === [...new Set(tonics)].length)
            flag = false;
    });

    if(!flag){
        alert('All pairs scale-tonic must be unique!');
    }

    return arrCheck;
}

const getTitle = () => {
    return document.getElementById('jamtrackName').value;
}

const getGenre = () => {
    if(!generalData.genre)
        generalData.genre = (document.getElementById('newGenre').value).trim();

    return generalData.genre;
}

const getTimeSignatures = () => {
    const newSignatures = document.getElementById('timeSignatures').value;
    const signatures = newSignatures.split(' ').map(x => x.trim());

    // Checks if every signature matches pattern of number/number and throws alert if it doesn't
    if(!signatures.every(x => new RegExp(/^\d+(\/\d+)$/).test(x))){
        alert('Time signatures are not correct. Only acceptable format is "number/number".\n' +
            'More than one signature can be supplied if distinct values are separated with spaces.');

        return false;
    }

    return signatures;
}

const getFile = () => {
    const fileInput = document.getElementById('formFile');

    if(fileInput.files)
        return fileInput.files[0];

    return false;
}

const getBPM = () => {
    const bpm = parseInt((document.getElementById('BPM').value).trim());

    if(isNaN(bpm)){
        alert('BPM must be an integer');
        return false;
    }

    return bpm;
}

const getFormData = () => {
    const artists = getArtists();
    const genre = getGenre();
    const timestamps = [];
    const title = getTitle();
    const scales = getScales();
    const signatures = getTimeSignatures();
    const bpm = getBPM();

    if(!scales || !artists || !genre || !signatures || !bpm || !title){
        // Incorrect time signatures, timestamps and bpm generate their own alerts
        if(signatures && bpm)
            alert('Fill form data before sending it');

        return false;
    }

    // If there's only one scale timestamps aren't needed and will be ignored by server anyway
    if(scales.length > 1){
        generalData.scaleTimestampsField.forEach(x => timestamps.push(getScaleTimestamps(x)));

        if(scales.length > 1 && timestamps.some(x => x === false)){
            return false;
        }
    }

    let postScales = scales.map((scale, index) => {
        scale.timeStamps = timestamps[index] ?? null // null will be passed if
        return scale;
    });

    return {
        genre: genre,
        title: title,
        scales: postScales,
        timeSignatures: signatures,
        artists: artists,
        bpm: bpm
    }
}

const postData = async function (event){
    const url = 'https://localhost:8000/jamtrack/fileupload';
    let file = getFile();
    const data = getFormData();

    if(!data)
        return;

    event.preventDefault();

    if(!file)
        return false;

    const formData = new FormData();
    formData.append('file', file, file.name);

    // Sending the file only at first, if it will be too big or anything
    // there won't be any need to send additional data
    const post = await fetch(url, {
        method: 'POST',
        body: formData
    });
    //console.log(post.status);
    const response = await post;
    const responseJson = await response.json();
    console.log(responseJson);
    console.log(response.status);
    if(response.status === 201){
        const urlDesc = 'https://localhost:8000/jamtrack/addfiledescription';
        data.jamtrack = responseJson.uuid;

        event.preventDefault();

        console.log(JSON.stringify(data));
        const postDesc = await fetch(urlDesc, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const responseDesc = await postDesc.json();
        console.log(responseDesc);
    }
}

// Accepts any amount of arguments but the first one needs to be html type
// The rest of them are classes
const createElement = (...args) => {
    const elem = document.createElement(args[0]);

    for(let i = 1; i < args.length; i++)
        elem.classList.add(args[i]);

    return elem;
}

const tonicRecordElement = () => {
    const c2 = createElement('div', 'col', 'align-items-center', 'align-text-center');
    const chooseTonicTitle = createElement('label', 'text-light');
    chooseTonicTitle.innerText = "Choose tonic";

    const dummyForm = createElement('form');
    const dummyGroup = createElement('div', 'form-group');
    dummyGroup.appendChild(chooseTonicTitle);

    const tonicSelect = createElement('select');
    tonicSelect.classList.add('float-right');

    sounds.forEach((sound) => {
        const tonic = createElement('option');
        tonic.innerText = sound;
        tonicSelect.appendChild(tonic);
    });

    return {
        c2: c2,
        dummyForm: dummyForm,
        dummyGroup: dummyGroup,
        tonicSelect: tonicSelect
    }
}

const recordElement = (data, deletionCallback, createTonicCol) => {
    const elem = createElement('div', 'container', 'row', 'bg-info', 'rounded', 'p-2', 'mt-1');
    const c1 = createElement('div', 'col', 'align-items-center', 'align-text-center');
    const nameField = document.createElement('p');
    nameField.innerText = data.name;

    if(createTonicCol){

    }

    const deletionBut = createElement('button', 'btn', 'btn-danger', 'float-right');
    deletionBut.innerText = "X";
    deletionBut.dataParams = data;
    deletionBut.deletionRecord = elem;
    deletionBut.addEventListener('click', deletionCallback);

    const c3 = createElement('div', 'col-md-2', 'align-items-center', 'align-text-center');

    const toReturn = {
        elem: elem
    }

    elem.appendChild(c1);

    if(createTonicCol){
        const { c2, dummyForm, dummyGroup, tonicSelect } = tonicRecordElement();
        elem.appendChild(c2);
        c2.appendChild(dummyForm);
        dummyGroup.appendChild(tonicSelect);
        dummyForm.appendChild(dummyGroup);
        toReturn.tonic = tonicSelect;
    }

    elem.appendChild(c3);
    c1.appendChild(nameField);

    c3.appendChild(deletionBut);

    return toReturn;
}

const addTimestampData = (target, scale) => {
    const main = createElement('div', 'row', 'container');
    const label = createElement('label');
    label.innerText = 'Timestamps';
    const input = createElement('input', 'form-control');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Enter timestamps ex. 1:13');

    const hint = createElement('small', 'form-text', 'text-light');
    hint.innerText = `Write timestamps for this ${scale} scale in the text field above.`;

    main.appendChild(label);
    main.appendChild(input);
    main.appendChild(hint);
    target.appendChild(main);

    return input;
}

const deleteFromArray = (array, value) => {
    const index = array.indexOf(value);
    array.splice(index, 1);
    return index;
}

const deleteRecord = (rec) => {
    rec.parentNode.removeChild(rec);
}

const deleteScale = (evt) => {
    evt.preventDefault();
    deleteRecord(evt.currentTarget.deletionRecord);
    const index = deleteFromArray(generalData.scales, evt.currentTarget.dataParams.id);
    generalData.scaleTimestampsField.splice(index, 1);
}

const deleteGenre = (evt) => {
    evt.preventDefault();
    deleteRecord(evt.currentTarget.deletionRecord);
    generalData.genre = null;
}

const deleteArtist = (evt) => {
    evt.preventDefault();
    deleteRecord(evt.currentTarget.deletionRecord);

    deleteFromArray(generalData.artists, evt.currentTarget.dataParams.name);
}

const createArtistRecord = (evt) => {
    const data = evt.currentTarget.dataParams;

    if(generalData.artists.includes(data.name))
        return;

    const container = document.getElementById('chosenArtists');
    const recElem = recordElement(data, deleteArtist);

    container.appendChild(recElem.elem);
    generalData.artists.push(data.name);
}

const createGenreRecord = (evt) => {
    const data = evt.currentTarget.dataParams;

    const container = document.getElementById('chosenGenre');
    container.innerHTML = ""; //Empty the container just to be sure
    const recElem = recordElement(data, deleteGenre);

    container.appendChild(recElem.elem);

    generalData.genre = data.name;
}

const createScaleRecord = (evt) => {
    const data = evt.currentTarget.dataParams; // data = { name, id }

    const container = document.getElementById('chosenScales');
    const recElem = recordElement(data, deleteScale, true);

    const timestampData = addTimestampData(recElem.elem, data.name);
    container.appendChild(recElem.elem);

    generalData.scales.push(data.id);
    generalData.tonic.push(recElem.tonic);
    generalData.scaleTimestampsField.push(timestampData);
}

/*
 data = [{
    name,
    id
 }, ...]
 */
const fillDropdown = (target, data, onclickCallback) => {
    if(!data.length)
        return;

    data.forEach((entry) => {
        const drop = createElement('a', 'dropdown-item');
        drop.innerText = entry.name;

        const elem = target.appendChild(drop);
        elem.dataParams = { name: entry.name, id: entry.id };

        elem.addEventListener('click', onclickCallback);
    });
}

const getData = async (url) => {
    const data = await fetch(url, {redirect: "error"});

    if(data.status !== 200)
        alert(failedFetchAlert);

    return await data.json();
}

window.addEventListener('load', async () => {
    const scales = await getData('https://localhost:8000/scale/getAll');
    const genres = await getData('https://localhost:8000/genre/getAll');
    const artists = await getData('https://localhost:8000/artist/getAll');

    fillDropdown(
        document.getElementById('scaleSelect'),
        scales.map((x) => {
            return {
                id: x['Scale.id'],
                name: x['Scale.name']
            }
        }),
        createScaleRecord
    );

    fillDropdown(document.getElementById('genreSelect'), genres.response, createGenreRecord);
    fillDropdown(document.getElementById('artistSelect'), artists.response, createArtistRecord);

    document.getElementById('submitScale').addEventListener('click', postData);
});