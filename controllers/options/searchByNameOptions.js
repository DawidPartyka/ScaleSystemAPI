const { Op } = require("sequelize");

module.exports = (name) => {
    return {
        [Op.or]: [
            {
                name: {
                    [Op.like]: `%${name}%`,
                }
            },
            {
                name: {
                    [Op.like]: `%${name.charAt(0).toUpperCase() + name.slice(1)}%`
                }
            },
            {
                name: {
                    [Op.like]: `%${name.toLowerCase()}%`
                }
            }
        ]
    }
}