import { sounds, Fretboard, Scale, ScaleLib, soundSelect, buttonSoundClick } from "./fretboardModules.js";
import { getData } from "../utils/utils.js";

const strings = 6;
const frets = 12;
let scaleLibInstance = null;
let privateScaleLibInstance = null; // private for specific user

const saveUserScale = (fretboardInstance) => {
    return () => {
        if(fretboardInstance.currentSounds.every(sound => !sound)){
            alert('Can\'t create a scale without a single sound in it!');
            return;
        }

        const hiddenFormContainer = document.getElementById('hiddenFormContainer');
        hiddenFormContainer.classList.toggle('d-none');
    }
}

const cancelSaveScale = () => {
    document.getElementById('hiddenForm').reset();
    document.getElementById('hiddenFormContainer').classList.toggle('d-none');
}

const confirmSaveScale = (fretboardInstance) => {
    return async () => {
        const data = {
            name: document.getElementById('scaleName').value,
            tonic: document.getElementById('scaleTonicOption').value,
            scale: fretboardInstance.currentSounds
        }

        if(!data.name || !data.tonic || !data.scale){
            alert('Fill form data before saving the scale');
            return;
        }

        const create = await new Scale(data).saveNewScale();

        cancelSaveScale();

        if(create.response.status === 201)
            alert('Saved your new scale');
        else
            alert(
                `Sorry, something went wrong.\n
                ${JSON.stringify(create.json)}\nStatus: 
                ${create.response.status}`
            );
    }
}

const findPossibleScales = (fretboardInstance) => {
    return async () => {
        const currentSounds = fretboardInstance.currentSounds;
        const soundSymbols = [];
        currentSounds.forEach((sound, index) => {
            if(sound)
                soundSymbols.push(sounds[index].replace('#', 's'));
        });

        const apiEndpoint = '/scale/findPossibleScales/' + soundSymbols.join('-');

        const data = await getData(apiEndpoint, 'Something didn\'t go as planned');
        console.log(data);
    }
}

const init = async () => {
    // Creates both logical and DOM fretboard
    const container = document.getElementById('fretboard');
    const fretboardInstance = new Fretboard(
        container,
        frets,
        strings,
        ['E', 'B', 'G', 'D', 'A', 'E'],
        true
    ).create();

    // Handling the buttons meant to add and remove sounds from the fretboard
    const soundButtons = document.getElementById('soundButtons');
    soundButtons.childNodes.forEach(node =>
        node.addEventListener('click', buttonSoundClick(fretboardInstance))
    )
    const checkButtons = {
        buttons: soundButtons.childNodes,
        classOn: 'btn-danger',
        classOff: 'btn-primary'
    }

    // Public scale list
    const scales = await getData('https://localhost:8000/scale/getAll');
    const scaleDropdown = document.getElementById('chooseScale');
    scaleLibInstance = new ScaleLib(scales).createAllScaleElements(scaleDropdown);
    scaleDropdown.addEventListener(
        'change',
        fretboardInstance.showScale(scaleLibInstance, checkButtons)
    );
    scaleDropdown.addEventListener('change', () => { // Resets private scale select
        privateScaleDropdown.selectedIndex = 0;
    });

    // Private scale list
    const privateScales = await getData('https://localhost:8000/scale/getAllUserScales');
    const privateScaleDropdown = document.getElementById('choosePrivateScale');
    privateScaleLibInstance = new ScaleLib(privateScales).createAllScaleElements(privateScaleDropdown);
    privateScaleDropdown.addEventListener('change',
        fretboardInstance.showScale(privateScaleLibInstance, checkButtons)
    );
    privateScaleDropdown.addEventListener('change', () => { // Resets public scale select
        scaleDropdown.selectedIndex = 0;
    });

    // Scale tonic handling
    const scaleTon = document.getElementById('scaleTon');
    const scaleTonOptions = soundSelect('A');
    scaleTon.appendChild(scaleTonOptions);
    scaleTon.addEventListener('change', (evt) => {
        if(fretboardInstance.currentScale)
            fretboardInstance.updateScaleToTonic(evt.target.value, checkButtons);
    });

    // Save user scale form buttons
    document.getElementById('saveUserScale').addEventListener('click', saveUserScale(fretboardInstance));
    document.getElementById('saveConfirm').addEventListener('click', confirmSaveScale(fretboardInstance));
    document.getElementById('saveCancel').addEventListener('click', cancelSaveScale);
    document.getElementById('whatScaleIsIt').addEventListener('click', findPossibleScales(fretboardInstance));
}

window.addEventListener('load', init);