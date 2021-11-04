const fileData = require('./getFileData');
const sound = require('./audioCalculation');
const path = require('path');

const uuidv4Regex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
const pendingFileRegex = new RegExp(/^[0-9A-F]{32}$/i);
const timestampRegex = new RegExp(/^\d+(:\d+)$/);
const timesignatureRegex = new RegExp(/^\d+(\/\d+)$/);

const validate = {
    // Checks if all values are in array are set (empty objects and stuff like that will still pass through tho)
    bulkNotNull: function (arr) {
        return arr.every(x => x ?? false);
    },

    statusCode: function (code) {
        return code >= 100 && code < 600;
    },

    validateDate: function (date){
        return date.every(x => !isNaN(Date.parse(x)));
    },

    compareDate: function (date1, date2){
        return new Date(date1).getTime() < new Date(date2).getTime();
    },

    dateRange: function (start, end) {
        return this.validateDate([start, end]) && this.compareDate(start, end);
    },

    isBoolean: function (val) {
        return typeof val === 'boolean';
    },

    numberNatural: function (num) {
        return Number.isInteger(num) && num >= 0;
    },

    // checks if id is uuidv4
    uuidv4: function (id) {
        return uuidv4Regex.test(id);
    },

    pendingFileName: function (id) {
        return pendingFileRegex.test(id);
    },

    uuidv4BulkCheck: function (ids){
        return ids.every(id => this.uuidv4(id));
    },

    stringValue: function (str) {
        return typeof(str) === 'string' && str.trim().length > 0;
    },

    indexInSoundArray: function (index) {
        if(isNaN(parseInt(index)))
            return false;

        const len = sound.soundArray.length;
        return index < len && index >= 0;
    },

    // checks if array of booleans if of correct length
    // and if it's array of sound symbols checks if all of them are unique and correct
    soundArray: function (arr) {
        if(arr.every(x => typeof x === 'boolean') && arr.length === sound.soundArray.length)
            return true;

        else if(arr.every(x => sound.soundArray.includes(x)) && this.isArrayUnique(arr))
            return true;

        return false;
    },

    // Checks the structure properties are allowed ('sounds', 'name', 'tonic')
    // and additionally checks if sounds if present are correct
    scalePatchStructure: function (patch) {
        const allowed = ['sounds', 'name', 'tonic'];

        if(patch.sounds && !this.soundArray(patch.sounds))
            return false;

        return Object.keys(patch).every(key => allowed.includes(key));
    },

    // Checks if array consists of unique elements
    isArrayUnique: function (arr) {
        return arr.length === [...new Set(arr)].length;
    },

    // Checks timestamps like 1:13 through regexp
    timeStampRegexp: function (arr) {
        return arr.every(x => timestampRegex.test(x));
    },

    // Checks if there's exactly two digits in seconds
    // provided and the value is between 0 - 59
    timeSeconds: function (arr) {
        return arr.every(x => {
            const sec = x.split(':')[1];
            const secInt = parseInt(sec);
            return sec.length === 2 && secInt >= 0 && secInt <= 59
        });
    },

    // Checks time signatures like 4/4 through regexp
    timeSignatureRegexp: function (arr) {
        return arr.every(x => timesignatureRegex.test(x));
    },

    // Checks if sound provided is in A-G# range, no flats allowed, only sharps
    checkSounds: function (arr) {
        return arr.every(x => sound.soundIndex(x) >= 0);
    },

    // Checks request body for jamtrack in addFileDescription controller
    uploadFileDescription: function (body) {
        if(!this.bulkNotNull([
            body.jamtrack,
            body.title,
            body.scales,
            body.timeSignatures,
            body.genre,
            body.artists,
            body.bpm
        ]))
            return false;

        if(!this.pendingFileName(body.jamtrack))
            return false;

        const fileName = path.join(process.env.UPLOADDIR, process.env.FILEPREFIX + body.jamtrack);
        const file = fileData.getData(`${fileName}.mp3`) || fileData.getData(`${fileName}.wav`);

        if (!file)
            return false;

        if (body.scales.length > 1) {
            const timestampCheck = body.scales.every(x => x.timeStamps.length > 0);

            if (!timestampCheck)
                return false;

            const areStampsUnique = [];
            body.scales.forEach(entry => areStampsUnique.concat(entry.timeStamps));

            if(!this.isArrayUnique(areStampsUnique))
                return false;

            if (!this.timeStampRegexp(areStampsUnique))
                return false;

            if(!this.timeSeconds(areStampsUnique))
                return false;

        }

        if (!this.isArrayUnique(body.timeSignatures))
            return false;

        if (!this.timeSignatureRegexp(body.timeSignatures))
            return false;

        // Checks if BPM is parse-able into integer
        if (isNaN(parseInt(body.bpm)))
            return false;

        if(!this.checkSounds(body.scales.map(x => x.tonic)))
            return false;

        return file;
    }
}

module.exports = validate;