const {loadScript} = require('../utils.js');

async function exec(folderPath) {
    var argv = [];
    for (var i = 0; i < arguments.length; ++i) argv[i] = arguments[i];

    const options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: argv.slice(1)
    }
    try {
        const data = await loadScript(`function_2/${argv[0]}`, options);
        return data;
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = {
    exec
}