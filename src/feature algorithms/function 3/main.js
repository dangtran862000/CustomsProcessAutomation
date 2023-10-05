const {loadScript} = require('../utils.js');

async function exec(folderPath) {
    var argv = [];

    var stringPath = window.location.pathname
    console.log(stringPath)

    stringPath = stringPath.substring(1)
    
    var filePythonPath = ""
    for (let i = 0; i < stringPath.split("/").slice(0,-7).length; i++) {  //slice(0,-7).length when package electron
        console.log(stringPath.split("/").slice(0,-7)[i])
        filePythonPath += stringPath.split("/").slice(0,-7)[i] + "/"
    }

    filePythonPath = decodeURI(filePythonPath)
    console.log(filePythonPath)

    for (var i = 0; i < arguments.length; ++i) argv[i] = arguments[i];

    const options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: argv.slice(1),
        pythonPath: filePythonPath+'backend/function_3/dist/main.exe'
    }
    try {
        const data = await loadScript(`function_3/${argv[0]}`, options);
        return data;
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = {
    exec
}