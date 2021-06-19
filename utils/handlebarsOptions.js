const package = require('../package.json');
const routes = require("../routing/routes");
const { menuList } = require('./hbsHelpers');
const { allPanels: userMenuOpt } = require('../controllers/options/userPanelOptions');
const { allPanels: managementMenuOpt } = require('../controllers/options/panelOptions');

module.exports = {
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        menuList: menuList,

        homeUrl: () => routes.home,

        // Shorthand just to be able to create a menu without passing the list parameter
        userMenu: () => menuList(userMenuOpt),

        // Shorthand just to be able to create a menu without passing the list parameter
        managementMenu: () => menuList(managementMenuOpt),

        routes: (value, options) => options.fn({ routes }),

        version: package.version
    }
}