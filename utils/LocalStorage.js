const fs = require('fs');

class LocalStorage {
    constructor({filePath, defaultProps}) {
        this.path = filePath;
        this.data = defaultProps;
    }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        this.data[key] = val;
        this.setAll();
    }

    setAll() {
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    parse(filePath = this.path, defaults = this.data) {
        try {
            const data = fs.readFileSync(filePath);
            return Object.assign(this.data, JSON.parse(data));
        } catch(error) {
            return defaults;
        }
    }
}

module.exports = LocalStorage;