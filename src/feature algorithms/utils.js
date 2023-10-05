const {PythonShell} = require('python-shell');

async function loadScript(file, ...args) {
    const fixedPath = './backend'
    return PythonShell.run(`${fixedPath}/${file}`, ...args)
}

module.exports = {
    loadScript
}