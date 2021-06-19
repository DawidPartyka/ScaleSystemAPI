const formidable = require('formidable');

module.exports = function (){
    const form = new formidable.IncomingForm();
    form.minFileSize = 2 * 1024 * 1024; // 2MB
    form.maxFileSize = 100 * 1024 * 1024; // 100MB
    form.allowEmptyFiles = false;
    form.keepExtensions = true;
    form.uploadDir = process.env.UPLOADDIR;

    return form;
};