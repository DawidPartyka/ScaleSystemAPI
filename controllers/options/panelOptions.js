const routes = require("../../routing/routes");

const panelObject = (name, link) => {
    return {
        name: name,
        href: link
    }
}

const jamtrackPanelData = {
    name: 'Jamtrack',
    panels: [
        panelObject('Overview', routes.jamtrack.getAll),
        panelObject('Full panel', routes.management.fullJamtrackPanel),
        panelObject('Add', routes.management.jamtrackAddPanel),
        panelObject('Delete', routes.management.jamtrackDeletePanel),
        panelObject('Update', routes.management.jamtrackUpdatePanel)
    ]
}

const scalePanelData = {
    name: 'Scale',
    panels: [
        panelObject('Full panel', routes.management.fullScalePanel)
    ]
}

const artistPanelData = {
    name: 'Artist',
    panels: [
        panelObject('Full panel', routes.management.fullArtistPanel)
    ]
}

const genrePanelData = {
    name: 'Genre',
    panels: [
        panelObject('Full panel', routes.management.fullGenrePanel)
    ]
}

const timeSignaturePanelData = {
    name: 'Time Signature',
    panels: [
        panelObject('Full panel', routes.management.fullTimeSignaturePanel)
    ]
}

exports.jamtrackPanelData = jamtrackPanelData;
exports.genrePanelData = genrePanelData;
exports.artistPanelData = artistPanelData;
exports.timeSignaturePanelData = timeSignaturePanelData;
exports.scalePanelData = scalePanelData;
exports.allPanels = [
    jamtrackPanelData,
    genrePanelData,
    artistPanelData,
    timeSignaturePanelData,
    scalePanelData
]
