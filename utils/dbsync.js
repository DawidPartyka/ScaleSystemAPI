const pathModels = '../models/';
const options = require(pathModels + 'options/standardSyncConfiguration');

const { Tuning, User, UserLog, UserScale, TimeSignature, Scale, ScaleViews, Management, Jamtrack, Cover, Instrument,
    CustomScale, Artist, JamtrackScales, JamtrackArtists, JamtrackTimeSignatures, Genre, Featured }
    = require(pathModels + 'allModels');

const sequelize = require('./postgresConnection');
const { DataTypes } = require('sequelize');

module.exports = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    TimeSignature.belongsToMany(Jamtrack, {through: {model: JamtrackTimeSignatures, unique: false}});
    Jamtrack.belongsToMany(TimeSignature, {through: {model: JamtrackTimeSignatures, unique: false}});

    //Jamtrack.belongsToMany(Scale, {through: {model: JamtrackScales, unique: false}});
    Jamtrack.hasMany(JamtrackScales);
    JamtrackScales.belongsTo(Jamtrack);
    //Scale.belongsToMany(Jamtrack, {through: {model: JamtrackScales, unique: false}});
    Scale.hasMany(JamtrackScales);
    JamtrackScales.belongsTo(Scale);

    Artist.belongsToMany(Jamtrack, {through: {model: JamtrackArtists, unique: false}});
    Jamtrack.belongsToMany(Artist, {through: {model: JamtrackArtists, unique: false}});

    Scale.belongsToMany(User, {through: UserScale});
    User.belongsToMany(Scale, {through: UserScale});

    Scale.hasMany(Featured, options);
    Featured.belongsTo(Scale, options);

    Jamtrack.belongsTo(Genre, options);
    Genre.hasMany(Jamtrack, options);

    Jamtrack.belongsTo(Cover, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        foreignKey: {
            type: DataTypes.UUID,
            allowNull: true
        }
    });
    Cover.hasMany(Jamtrack, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        foreignKey: {
            type: DataTypes.UUID,
            allowNull: true
        }
    });

    Management.belongsTo(User, options);
    User.hasOne(Management, options);

    Instrument.belongsTo(User, options);
    User.hasMany(Instrument, options);

    Instrument.belongsTo(Tuning, options);
    Tuning.hasMany(Instrument, options);

    CustomScale.belongsTo(User, options);
    User.hasMany(CustomScale, options);

    ScaleViews.belongsTo(Scale,options);
    Scale.hasMany(ScaleViews, options);

    ScaleViews.belongsTo(User,options);
    User.hasMany(ScaleViews, options);

    UserLog.belongsTo(User, options);
    User.hasMany(UserLog, options);

    await sequelize.sync();
}
