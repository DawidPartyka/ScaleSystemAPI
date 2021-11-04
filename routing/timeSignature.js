const { TimeSignature } = require('../models/allModels');
const genericRouter = require('./genericRouter');
const validate = require('../utils/validations');

function nameValidation (name) {
    return validate.timeSignatureRegexp([name]);
}

const router = genericRouter(
    TimeSignature,
    'timeSignature',
    'Time Signature',
    'signature',
    nameValidation
);

module.exports = router.create();