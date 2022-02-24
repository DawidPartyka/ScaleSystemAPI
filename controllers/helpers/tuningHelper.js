import {sounds} from "../../public/js/fretboard/fretboardModules";

const { Tuning, UserTuning, UserDefaultTuning } = require('../../models/allModels');

const tuningConstraint = (sounds, octaves) => {
    return {
        sounds: sounds,
        octaves: octaves
    }
}

const tuningHelper = {
    find: async (sounds, octaves) => {
        return await Tuning.findOne({
            where: tuningConstraint(sounds, octaves)
        });
    },

    create: async (sounds, octaves) => {
        return await Tuning.create(tuningConstraint(sounds, octaves));
    },

    findOrCreate: async (sounds, octaves) => {
        const found = await this.find(sounds, octaves);

        if(found)
            return found;

        return await this.create(sounds, octaves);
    }
}

const userTuningHelper = {
    getByTuning: async (sounds, octaves) => {
        return await UserTuning.findOne({
            include: [{
                model: Tuning,
                where: tuningConstraint(sounds, octaves)
            }]
        });
    },

    getByTuningId: async (id) => {
        return await UserTuning.findOne({
            include: [{
                model: Tuning,
                where: {
                    id: id
                }
            }]
        });
    },

    getByUserId: async (id) => {
        return await UserTuning.findAll({
            include: Tuning,
            where: {
                UserId: id
            }
        });
    },

    exists: async (userId, tuningId) => {
        const tunings = await UserTuning.count({
            where: {
                UserId: userId,
                TuningId: tuningId
            }
        });

        return tunings === 1;
    },

    create: async (userId, sounds, octaves) => {
        const requestedTuning = await tuningHelper.findOrCreate(sounds, octaves);
        const exists = await this.exists(userId, requestedTuning.id);

        if(exists)
            return false;

        return await UserTuning.create({
            UserId: userId,
            TuningId: requestedTuning.id
        });
    },

    setAsDefault: async (userId, sounds, octaves) => {
        const requestedTuning = await tuningHelper.findOrCreate(sounds, octaves);
        const exists = await UserDefaultTuning.count({ where: { UserId: userId }}) === 1;

        if(exists)
            return await UserDefaultTuning.update(
                { TuningId: requestedTuning.id },
                { where: { UserId: userId } }
            )

        return await UserDefaultTuning.create({
            UserId: userId,
            TuningId: requestedTuning.id
        });
    }
}

module.exports = {
    tuning: tuningHelper,
    userTuning: userTuningHelper
};
