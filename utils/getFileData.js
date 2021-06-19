const fs = require('fs');
const path = require('path')
const { getAudioDurationInSeconds } = require('get-audio-duration');

const fileOperations = {
    getData: function(filePath) {
        if(!this.checkIfExists(filePath))
            return false;

        const stats = fs.statSync(filePath);
        const sizeByte = stats.size;
        const sizeMB = (sizeByte / (1024 * 1024)).toFixed(2); // in MB with 2 decimal points
        const ext = path.extname(filePath);

        return {
            sizeByte: sizeByte,
            sizeMB: sizeMB,
            ext: ext,
            filePath: filePath
        }
    },

    move: function (oldPath, newPath, name) {
        if(name)
            fs.rename(oldPath, newPath, name);
        else
            fs.rename(oldPath, newPath, (err) => {
            if (err)
                return console.error(err);
            else
                console.log(`Moved file ${oldPath} - ${newPath}`);
        });
    },

    getStat: function (filePath) {
        if(!this.checkIfExists(filePath))
            return false;

        return fs.statSync(filePath);
    },

    checkIfExists: function (filePath) {
        return fs.existsSync(filePath);
    },

    createDir: function (dirPath) {
        fs.mkdir(dirPath, (err) => {
            if (err)
                return console.error(err);
        });
    },

    getAudioLength: async (file) => {
        const fileDuration = await getAudioDurationInSeconds(file);
        const minutes = parseInt(fileDuration.toFixed() / 60);
        const seconds = parseInt(fileDuration.toFixed() - minutes * 60);

        return `${minutes}:${seconds}`;
    },

    deleteFile: async function (path) {
        if(!this.getStat(path))
            return false;

        await fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return false;
            }

            return true;
        });
    }
}

module.exports = fileOperations;