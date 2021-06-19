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
        panelObject('Overview', routes.jamtrack.getAll)
    ]
}

const scalePanelData = {
    name: 'Scale',
    panels: [
        panelObject('My private scales', routes.user.scaleLibrary),
        panelObject('Fretboard', routes.user.fretboard),
        panelObject('Public scales', routes.scale.allPublicList)
    ]
}

exports.jamtrackPanelData = jamtrackPanelData;
exports.scalePanelData = scalePanelData;

exports.allPanels = [
    jamtrackPanelData,
    scalePanelData
]