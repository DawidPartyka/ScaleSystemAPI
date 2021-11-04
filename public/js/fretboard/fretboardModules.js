import { createDomElement } from "../utils/utils.js";

export const sounds = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export const buttonSoundClick = (fretboardInstance) => {
    return (evt) => {
        const classOn = 'btn-danger';
        const classOff = 'btn-primary';

        fretboardInstance.switchSoundOnOff(evt.target.value);

        evt.target.classList.toggle(classOn);
        evt.target.classList.toggle(classOff);
    }
}

export const soundSelect = (selected, classes) => {
    const select = createDomElement('select', classes instanceof Array ? classes : [])

    sounds.forEach((sound) => {
        const option = createDomElement('option', [], sound);
        option.value = sounds.indexOf(sound);

        if(sound === selected)
            option.selected = true;

        select.appendChild(option);
    });

    return select;
}

export class ScaleLib{
    constructor(scales) {
        this.scales = [];

        if(scales)
            scales.forEach(scale => this.scales.push(new Scale(scale)));

        return this;
    }

    createAllScaleElements(target){
        this.scales.forEach(scale => scale.createDomElement(target));

        return this;
    }

    findById(id) {
        return this.scales.find(scale => scale.id === id);
    }
}

export class Scale{
    constructor(data) {
        this.id = data['Scale.id'] ?? data.id;

        this.sounds = data['Scale.sounds'] ?
            data['Scale.sounds'].split('').map(x => x === '1') :
            data.scale ?? data.sounds?.split('').map(x => x === '1');

        this.name = data['Scale.name'] ?? data.name;
        this.tonic = data['Scale.tonic'] ?? data.tonic;

        return this;
    }

    createDomElement(target) {
        const elem = createDomElement('option', null, this.name);
        elem.value = this.id;
        target.appendChild(elem);

        return elem;
    }

    shiftToTonic(targetTonic) {
        const diff = this.tonic - targetTonic;
        const arrCopy = [...this.sounds];

        if(diff === 0)
            return arrCopy;

        return arrCopy.splice(diff, arrCopy.length - diff).concat(arrCopy);
    }

    async saveNewScale() {
        const rawResponse = await fetch('https://localhost:8000/scale/addScale', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scale: this.sounds,
                name: this.name,
                tonic: this.tonic
            })
        });

        const response = await rawResponse;
        const jsonResponse = await response.json();

        return { response: response, json: jsonResponse }
    }
}

export class Note{
    constructor(index) {
        this.sound = sounds[index];
        this.domElement = null;

        return this;
    }

    create() {
        const colorClass = `n${this.sound.replace('#', 's')}`;
        this.domElement = createDomElement(
            'div',
            ['rounded', 'col-example', 'p-1', 'fret_mark', colorClass],
            this.sound
        );
        return this;
    }
}

export class Fret{
    constructor() {
        this.domElement = null;
        this.mark = null;

        return this;
    }

    create(target) {
        this.domElement = createDomElement('div', ['col', 'fret_place', 'd-flex', 'justify-content-center']);
        target.appendChild(this.domElement);

        return this;
    }

    noteMark(note) {
        this.mark = note;
        this.domElement.appendChild(this.mark.domElement);

        return this;
    }

    clear(){
        if(!this.mark)
            return;

        this.domElement.removeChild(this.mark.domElement);
        this.mark = null;
    }
}

export class StringLane{
    constructor(frets, tuning, tuningChange) {
        this.frets = frets;
        this.tuning = tuning;
        this.tuningElement = null;
        this.lane = null;
        this.tuningChange = tuningChange;
        this.fretInstances = [];
        return this;
    }

    create(target){
        this.lane = createDomElement('div', ['row', 'bg-dark', 'fret_lane'])
        target.appendChild(this.lane);

        this.tuningElement = this.tuningChange ? soundSelect(this.tuning) :
            createDomElement('div', ['bg-success', 'fixed_tuning'], this.tuning);

        this.lane.appendChild(this.tuningElement);
        this.tuningElement.addEventListener('change', this.updateTuning);

        const fretsDisplay = this.frets + 1;

        for(let i = 0; i < fretsDisplay; i++){
            this.fretInstances.push(new Fret().create(this.lane));
        }

        return this;
    }

    updateTuning(evt){
        this.tuning = evt.target.value;
    }

    findSoundPlace(soundIndex){
        const places = [];
        if(!this.tuning)
            return;

        const currentTuning = sounds.indexOf(this.tuning);
        const diff = currentTuning - soundIndex;
        let currentToPush = diff <= 0 ? Math.abs(diff) : 12 - diff;

        while(this.fretInstances.length > currentToPush){
            places.push(currentToPush);
            currentToPush += 12;
        }

        return places;
    }

    markSound(soundIndex){
        const places = this.findSoundPlace(soundIndex);

        places.forEach(place => {
            const mark = new Note(soundIndex).create();
            this.fretInstances[place].noteMark(mark);
        });

        return this;
    }

    removeMark(soundIndex){
        this.findSoundPlace(soundIndex)
            .forEach(place => this.fretInstances[place].clear());

        return this;
    }

    clearAllFrets(){
        this.fretInstances.forEach(fret => fret.clear());
        return this;
    }
}

export class Fretboard{
    constructor(container, frets, strings, tuning, allowTuningChange){
        this.frets = frets;
        this.strings = strings;
        this.stringInstances = [];
        this.domElement = container;
        this.currentScale = null;
        this.currentSounds = [false, false, false, false, false, false, false, false, false, false, false, false];
        this.tuning = tuning;
        this.allowTuningChange = allowTuningChange;
        return this;
    }

    create(){
        for(let i = 0; i < this.strings; i++){
            this.stringInstances.push(
                new StringLane(this.frets, this.tuning[i], this.allowTuningChange)
                    .create(this.domElement)
            );
        }

        return this;
    }

    // checkButtons is optional. If passed it will mark buttons related to currently displayed sounds from the scale
    updateScaleToTonic(newTonic, checkButtons) {
        this.currentSounds = this.currentScale.shiftToTonic(sounds.indexOf(newTonic));
        this.addSoundMarksOnStrings(checkButtons);
    }

    // checkButtons is optional. If passed it will mark buttons related to currently displayed sounds from the scale
    showScale(libInstance, checkButtons) {
        return (evt) => {
            const scaleTonicSelect = document.getElementById('scaleTon').value;
            this.currentScale = libInstance.findById(evt.target.value);
            this.currentSounds = this.currentScale.shiftToTonic(sounds.indexOf(scaleTonicSelect));
            this.addSoundMarksOnStrings(checkButtons);
        }
    }

    // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
    // Adds sound marks for EVERY sound on ALL strings!
    addSoundMarksOnStrings(checkButtons) {
        this.stringInstances.forEach((string) => {
            string.clearAllFrets();

            this.currentSounds.forEach((sound, index) => {
                if (sound)
                    string.markSound(index);
            });
        });

        if(checkButtons)
            this.checkSoundButtonClasses(checkButtons);
        else
            return this;
    }

    // If buttons representing sounds are present it will toggle the display of them depending
    // on sound it represents is displayed in current scale or not
    checkSoundButtonClasses(checkButtons) {
        let iterator = 0;

        checkButtons.buttons.forEach((button) => {
            if(button.tagName === 'BUTTON'){
                // split in two ifs to not make a check too long
                if(this.currentSounds[iterator] && button.classList.contains(checkButtons.classOff)){
                    button.classList.toggle(checkButtons.classOn);
                    button.classList.toggle(checkButtons.classOff);
                }
                else if(!this.currentSounds[iterator] && button.classList.contains(checkButtons.classOn)){
                    button.classList.toggle(checkButtons.classOn);
                    button.classList.toggle(checkButtons.classOff);
                }

                iterator++;
            }
        });

        return this;
    }

    // Iterates through strings adding / removing sound.
    // If sound passed in argument is currently "marked" in current position it will remove it and vice versa
    // --------------------------------
    // It's useful ONLY for sounds that were added globally (on all strings through addSoundMarksOnStrings method)
    // otherwise if let's say sound was added on one specific fret it will remove it
    // from this exact location and add it in all other ones!
    switchSoundOnOff(sound) {
        const index = sounds.indexOf(sound);
        this.currentSounds[index] = !this.currentSounds[index];

        this.stringInstances.forEach(string =>
            this.currentSounds[index] ?
                string.markSound(index) :
                string.removeMark(index)
        );
    }
}



