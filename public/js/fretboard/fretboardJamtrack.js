import { Fretboard, Scale } from "./fretboardModules.js";
import { getData } from "../utils/utils.js";

const strings = 6;
const frets = 12;

class JamtrackData{
    constructor(data) {
        this.name = data.obj.name;
        this.id = data.obj.id;
        this.ext = data.obj.ext;
        this.size = data.obj.size;
        this.ext = data.obj.ext;
        this.bpm = data.obj.bpm;
        this.scalesRaw = data.scales;
        this.scales = [];

        return this;
    }

    async processRawScales(){
        for (let i = 0; i < this.scalesRaw.length; i++) {
            const scaleData = await getData(`https://localhost:8000/scale/getbyid/${this.scalesRaw[i].Scale.id}`);
            const splitTimestamp = this.scalesRaw[i].ScaleTimestamp.split(':');

            const scaleObj = {
                data: new Scale(scaleData.Scale),
                timestamp: this.scalesRaw[i].ScaleTimestamp,
                minutes: parseInt(splitTimestamp[0]),
                seconds: parseInt(splitTimestamp[1])
            }

            scaleObj.data.sounds = scaleObj.data.shiftToTonic(this.scalesRaw[i].tonic); // shifting the scale to correct tonic beforehand

            this.scales.push(scaleObj);
        }

        return this;
    }

    createScaleQueue(){
        // sorts scales into a correct order of their occurrence in the jamtrack based on the timestamps
        this.scales = this.scales.sort((a, b) =>
            (a.minutes > b.minutes || a.minutes === b.minutes && a.seconds > b.seconds ? 1 : -1));

        return this;
    }

    findScaleByTimestamp(timestamp){
        //console.log(this.scales);
        return this.scales.find(scale => scale.timestamp === timestamp);
    }

    // needs this.createScaleQueue() be called before this!
    findScaleTimestampByClosestTimestampUp(timestamp){
        let scale = this.scales.find((x) => {
            const min = parseInt(timestamp.split(':')[0]);
            const sec = parseInt(timestamp.split(':')[1]);
            if(x.minutes > min)
                return true;

            return x.minutes === min && x.seconds > sec;
        });

        return scale.timestamp;
    }
}

// id is at the end of URL like https://localhost:8000/user/playfretboard/{id}
const getJamtrackId = () => {
    return new URL(location).pathname.split('/').slice(-1).pop();
}

const getJamtrackData = async () => {
    const jamtrackId = getJamtrackId();
    return await getData(`https://localhost:8000/jamtrack/getbyid/${jamtrackId}`, 'Sorry, something went wrong.');
}

class AudioPlayer {
    constructor(jamtrackDataInstance, fretboardInstance) {
        this.currentScaleTimestamp = null;
        this.audioPlayer = null;
        this.jamtrack = jamtrackDataInstance;
        this.fretboard = fretboardInstance;

        return this;
    }

    create() {
        const url = getJamtrackId();
        const cont = document.getElementById('audioContainer');

        this.audioPlayer = new Audio(`https://localhost:8000/jamtrack/filestream/${url}`);
        cont.appendChild(this.audioPlayer);
        this.audioPlayer.setAttribute('controls', 'controls');
        this.audioPlayer.setAttribute('controlsList', 'nodownload');

        this.audioPlayer.ontimeupdate = this.checkScaleChange();

        return this;
    }

    getCurrentTime() {
        const time = parseInt(this.audioPlayer.currentTime);
        const minutes = parseInt(time / 60);
        const seconds = parseInt(time - minutes * 60);
        const secondsString = seconds.toString().length === 2 ? seconds : `0${seconds}`;

        return `${minutes}:${secondsString}`;
    }

    switchCurrentTimestamp(instance, timestamp) {
        instance.currentScaleTimestamp = timestamp;
    }

    checkScaleChange() {
        const self = this;

        return () => {
            const scaleTimestamp = self.jamtrack.findScaleTimestampByClosestTimestampUp(this.getCurrentTime());

            if(scaleTimestamp === self.currentScaleTimestamp)
                return;

            const scale = self.jamtrack.findScaleByTimestamp(scaleTimestamp);

            const change1 = getElementByText(self.currentScaleTimestamp, 'p');
            const change2 = getElementByText(scaleTimestamp, 'p');
            if(change1)
                change1.style.color = "white";
            if(change2)
                change2.style.color = "#ff0066";

            self.switchCurrentTimestamp(self, scaleTimestamp);
            self.fretboard.currentSounds = scale.data.sounds;
            self.fretboard.addSoundMarksOnStrings();

        }
    }
}

const getElementByText = (search, tag) => {
    let tags = document.getElementsByTagName(tag);
    let found;

    for (let i = 0; i < tags.length; i++) {
        if (tags[i].textContent.includes(search)) {
            found = tags[i];
            break;
        }
    }

    return found;
}

const init = async () => {
    // Creates both logical and DOM fretboard
    const container = document.getElementById('fretboard');
    const fretboardInstance = new Fretboard(
        container,
        frets,
        strings,
        ['E', 'B', 'G', 'D', 'A', 'E']
    ).create();

    const jamtrackDataReceived = await getJamtrackData();
    const jamtrackInstance = await new JamtrackData(jamtrackDataReceived);
    await jamtrackInstance.processRawScales()
    jamtrackInstance.createScaleQueue();

   new AudioPlayer(jamtrackInstance, fretboardInstance)
        .create();
}

window.addEventListener('load', init);