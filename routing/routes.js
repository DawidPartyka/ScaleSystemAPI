const basePath = 'https://localhost:' + process.env.PORT;
const routes = {
    home: basePath + '/',
    about: basePath + '/about',
    noAuthorization: basePath + '/loginfirst',
    git: 'https://github.com/DawidPartyka',
    gitDependabot: 'https://github.com/dependabot',
    gitRepository: 'https://github.com/DawidPartyka/ScaleSystemAPI',
    gitRepo: 'https://github.com/DawidPartyka/ScaleSystemAPI',
    user: {
        user: basePath + '/user',
        login: basePath + '/user/login',
        logout: basePath + '/user/logout',
        signup: basePath + '/user/sign-up',
        userprofile: basePath + '/user/profile',
        checkuser: basePath + '/user/checkuser',
        getlogsrange: basePath + '/user/getlogs',
        fretboard: basePath + '/user/fretboard',
        playWithFretboard: basePath + '/user/playFretboard',
        scaleLibrary: basePath + '/user/myscalelibrary',
        scaleUpdate: basePath + '/user/privateScaleUpdate',
        showScale: basePath + '/user/showScale'
    },
    management: {
        base: basePath + '/management',
        fullJamtrackPanel: basePath + '/management/jamtrackpanel',
        jamtrackUpdatePanel: basePath + '/management/jamtrackupdatepanel',
        jamtrackDeletePanel: basePath + '/management/jamtrackdeletepanel',
        jamtrackAddPanel: basePath + '/management/jamtrackaddpanel',
        fullScalePanel: basePath + '/management/scalepanel',
        fullArtistPanel: basePath + '/management/artistpanel',
        fullTimeSignaturePanel: basePath + '/management/timesignaturepanel',
        fullGenrePanel: basePath + '/management/genrepanel',
        logDetails: basePath + '/management/logDetails'
    },
    scale: {
        base: basePath + '/scale',
        add: basePath + '/scale/addscale',
        allPublicList: basePath + '/scale/getPublicList'
    },
    jamtrack: {
        getByArtist: basePath + '/jamtrack/getbyartist',
        getByGenre: basePath + '/jamtrack/getbygenre',
        getAll: basePath + '/jamtrack/getAll'
    },
    css: {
      publicFiles: {
          main: basePath + '/style/main.css',
          fretboard: basePath + '/style/fretboard.css'
      }
    },
    img: {
        fret: basePath + '/img/fret.png',
        gitIcon: basePath + '/img/gitIcon.png',
        pleaseWait: basePath + '/img/pleaseWait.jpg',
        html: basePath + '/img/html.png',
        css: basePath + '/img/css.png',
        js: basePath + '/img/js.png',
        node: basePath + '/img/node.png',
        sequelize: basePath + '/img/sequelize.png',
        auth0: basePath + '/img/auth0.png',
        handlebars: basePath + '/img/handlebars.png',
        express: basePath + '/img/express.png',
        postgres: basePath + '/img/postgres.png',
        gitpfp: basePath + '/img/gitpfp.png',
        dependabot: basePath + '/img/dependabot.png'
    },
    js: {
        modules: {
            fretboard: basePath + '/js/fretboard/fretboard.js',
            playFretboard: basePath + '/js/fretboard/fretboardJamtrack.js',
            showScaleFretboard: basePath + '/js/fretboard/simpleScaleShow.js'
        },
        user: {
            deletePrivateScale: basePath + '/js/user/deletePrivateScale.js',
            updatePrivateScale: basePath + '/js/user/updatePrivateScale.js',
            userlogs: basePath + '/js/user/userlogsbydate.js'
        },
        artist: {
            addArtist: basePath + '/js/artist/addArtist.js',
            updateArtist: basePath + '/js/artist/updateArtist.js',
            deleteArtist: basePath + '/js/artist/deleteArtist.js',
            getAllArtists: basePath + '/js/artist/getAllArtists.js',
            getArtistById: basePath + '/js/artist/getArtistById.js'
        },
        scale: {
            getScaleVariations: basePath + '/js/scale/getScaleVariations.js',
            getAllScales: basePath + '/js/scale/getAllScales.js',
            getScaleById: basePath + '/js/scale/getScaleById.js',
            scaleUpdate: basePath + '/js/scale/updateScale.js',
            changeScaleTonic: basePath + '/js/scale/changeScaleTonic.js',
            deleteScale: basePath + '/js/scale/deleteScale.js',
            addScale: basePath + '/js/scale/addScale.js',
            getAllUserScales: basePath + '/js/scale/getAllUserScales.js',
            search: basePath + '/js/scale/search.js',
            searchPublic: basePath + '/js/scale/searchPublic.js',
            searchPrivate: basePath + '/js/scale/searchPrivate.js'
        },
        jamtrack: {
            jamtrackUpload: basePath + '/js/jamtrack/jamtrackUpload.js',
            jamtrackPlay: basePath + '/js/jamtrack/jamtrackPlay.js',
            getJamtrackByArtist: basePath + '/js/jamtrack/getJamtrackByArtist.js',
            getJamtrackById: basePath + '/js/jamtrack/getJamtrackById.js',
            updateJamtrack: basePath + '/js/jamtrack/updateJamtrack.js',
            getAllJamtracks: basePath + '/js/jamtrack/getAllJamtracks.js',
            deleteJamtrack: basePath + '/js/jamtrack/deleteJamtrack.js',
            deleteJamtrackArtist: basePath + '/js/jamtrack/deleteJamtrackArtist.js',
            deleteJamtrackScale: basePath + '/js/jamtrack/deleteJamtrackScale.js',
            deleteJamtrackTimeSignature: basePath + '/js/jamtrack/deleteJamtrackTimeSignature.js',
            addJamtrackArtist: basePath + '/js/jamtrack/addJamtrackArtist.js',
            addJamtrackScale: basePath + '/js/jamtrack/addJamtrackScale.js',
            addJamtrackTimesignature: basePath + '/js/jamtrack/addJamtrackTimesignature.js',
            search: basePath + '/js/jamtrack/search.js'
        },
        genre: {
            addGenre: basePath + '/js/genre/addGenre.js',
            updateGenre: basePath + '/js/genre/updateGenre.js',
            deleteGenre: basePath + '/js/genre/deleteGenre.js',
            getAllGenres: basePath + '/js/genre/getAllGenres.js',
            getGenreById: basePath + '/js/genre/getGenreById.js'
        },
        timeSignature: {
            addTimeSignature: basePath + '/js/timeSignature/addTimeSignature.js',
            updateTimeSignature: basePath + '/js/timeSignature/updateTimeSignature.js',
            deleteTimeSignature: basePath + '/js/timeSignature/deleteTimeSignature.js',
            getAllTimeSignatures: basePath + '/js/timeSignature/getAllTimeSignatures.js',
            getTimeSignatureById: basePath + '/js/timeSignature/getTimeSignatureById.js'
        },
        publicFiles: {
          headerbuttons: basePath + '/js/headerButtons.js'
      }
    }
}

module.exports = routes;