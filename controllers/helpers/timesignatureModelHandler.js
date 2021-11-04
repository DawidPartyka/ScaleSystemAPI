const TimeSignature = require('../../models/timeSignature');
const result = require('./resultObj');

const helper = {
    // signatures: [ sig1, sig2... ]
    findBySignature: async function(signatures) {
        const sigResult = [];

        for(const entry of signatures){
            const sigQuery = await TimeSignature.findOne({
                where: {
                    signature: entry
                }
            });

            const sigQueryRes = sigQuery ? result(true, sigQuery) : result(false, entry);
            sigResult.push(sigQueryRes);
        }

        return sigResult;
    },
    findBySignatureOrCreate: async function(signatures) {
        const sigResult = await this.findBySignature(signatures);

        if(!sigResult.some(x => x.result === false))
            return sigResult.map(x => x.value);

        const createdSignatures = await TimeSignature.bulkCreate(
            sigResult.filter(x => x.result === false)
                .map((x) => {
                    return {
                        signature: x.value
                    }
                }),
            { returning: true }
        );

        return sigResult.filter(x => x.result === true).map(x => x.value).concat(createdSignatures);
    }
}

module.exports = helper;