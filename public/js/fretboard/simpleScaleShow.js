import { Scale, Fretboard } from "./fretboardModules.js";
import { getData, getLastUrlParam } from "../utils/utils.js";

const init = async () => {
    // Creates both logical and DOM fretboard
    const container = document.getElementById('fretboard');
    const fretboardInstance = new Fretboard(
        container,
        12,
        6,
        ['E', 'B', 'G', 'D', 'A', 'E'],
        false
    ).create();

    // Public scale list
    const failedFetch = "Something went wrong";
    const scaleUrl = `https://localhost:8000/scale/getbyid/${getLastUrlParam()}`;
    const scale = await getData(scaleUrl, failedFetch);

    if(!scale)
        return;

    console.log(scale);
    const scaleInstance = new Scale(Array.isArray(scale) ? scale[0] : scale.Scale);
    fretboardInstance.currentSounds = scaleInstance.sounds;
    fretboardInstance.addSoundMarksOnStrings();
}

window.addEventListener('load', init);