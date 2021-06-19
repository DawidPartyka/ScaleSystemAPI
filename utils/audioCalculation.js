const sounds = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

const soundIndex = (x) => {
    return sounds.indexOf(x);
}

const indexSound = (x) => {
    return sounds[x];
}

const allVariations = (x) => {
    const variations = [];
    variations.push(x);

    for(let i = 0; i < x.length-1; i++){
        const [first, ...rest] = variations[i];
        variations.push([...rest, first]);
    }

    return variations;
}

const variationToTonic = (scale, tonic, targetTonic) => {
    if(typeof scale === 'string' || scale instanceof String)
        scale = scale.split('').map(x => Boolean(parseInt(x)));

    const tonicValue = isNaN(parseInt(tonic)) ? soundIndex(tonic) : tonic;
    const targetTonicValue = isNaN(parseInt(targetTonic)) ? soundIndex(targetTonic) : targetTonic;
    const diff = tonicValue - targetTonicValue;

    if(diff === 0)
        return { scaleScheme: scale, scaleTonic: targetTonic };

    const scaleSlice = scale.splice(diff, scale.length - diff).concat(scale);

    return { scaleScheme: scaleSlice, scaleTonic: targetTonic }
}

const allVariationsWithTonic = (scale, tonic) => {
    if(Number.isInteger(tonic))
        tonic = indexSound(tonic);

    const variations = [];

    sounds.forEach(sound => variations.push(variationToTonic(scale, tonic, sound)));

    return variations;
}

exports.soundArray = sounds;
exports.soundIndex = soundIndex;
exports.indexSound = indexSound;
exports.allVariations = allVariations;
exports.variationToTonic = variationToTonic;
exports.allVariationsWithTonic = allVariationsWithTonic;