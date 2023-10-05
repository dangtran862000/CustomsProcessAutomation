const {loadScript} = require('../utils.js');
const file = require('fs/promises');
const fileSync = require('fs');
const path = require('path');
var JSZip = require("jszip");
const unzipper = require('unzipper');

async function exec() {
    var argv = [];
    for (var i = 0; i < arguments.length; ++i) argv[i] = arguments[i];

    let stringPath = window.location.pathname;
    let pythonPath = "";
    const currentPath = stringPath.substring(1).split('/').slice(0, -7);
    for (let i = 0; i < currentPath.length; i++) {
        pythonPath += stringPath.substring(1).split("/").slice(0, -7)[i] + "/";
    }

    pythonPath = `${pythonPath}backend/function_1/dist/main.exe`;
    pythonPath = decodeURI(pythonPath)

    const options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: argv.slice(1),
        // pythonPath: 'D:/Project/Capstone Project (with UI)/Cap git/backend/function_1/dist/main.exe'
        pythonPath
    }
    try {
        const data = await loadScript(`function_1/${argv[0]}`, options);
        return data;
    } catch(e) {
        throw new Error(e);
    }
}

function extractRemainFiles(allFiles, reducedFiles) {
    reducedFiles = reducedFiles.map(file => file.fileName);
    const remainFiles = [];
    for (let j = 0; j < allFiles.length; j++) {
        const isExisted = reducedFiles.includes(allFiles[j].fileName)
        if (!isExisted)
            remainFiles.push(allFiles[j]);
    }
    return remainFiles;
}

async function getRemainFiles(CDS_folder, automateType) {
    const path = `${CDS_folder}\\complete`

    // Get all file names of the folder. But exclude the 'complete' folder
    const allFiles = (await file.readdir(CDS_folder)).filter(
        file => file !== 'complete' && file !== 'files' && file !='zips'
    );
    
    // Parse the 'complete/zips' folder to get the zipped folder
    let zipFolder;
    if (automateType === 'import') {
        zipFolder = `${path}\\zips`;
    } else {
        zipFolder = `${path}`
    }

    const completeFolders = await Promise.allSettled(
        ((await file.readdir(zipFolder)).map(async folder => {
            const path = `${zipFolder}\\${folder}`;
            if (!folder.includes(".zip"))
                throw new Error("not this");

            let completeFolder = fileSync.readFileSync(path);
            let zip = await JSZip.loadAsync(completeFolder);
            let files = Object.keys(zip.files).filter(file => file.includes(".xls"));
            return {[folder.split('.zip')[0]]: files};
        }))
    )
    // console.log(completeFolders);

    // Extract all files from the CDS folder
    // Each element in the validLogs is all of the files of that CDS folder
    const errorLogs = [];
    const validLogs = [];
    for (let i = 0; i < completeFolders.length; i++) {
        if (completeFolders[i].status !== 'fulfilled')
            errorLogs.push(completeFolders[i].value)
        else
            validLogs.push(completeFolders[i].value);
    }

    const remainFiles = [];
    for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        let isExisted = false;
        for (let j = 0; j < validLogs.length; j++) {
            const zipFolderName = Object.keys(validLogs[j])[0]
            const fileNames = validLogs[j][zipFolderName]

            isExisted = fileNames.includes(file);
            if (isExisted) {
                break;
            }
        }
        if (!isExisted) {
            remainFiles.push({
                fileName: file,
                complete: false,
                date: null
            });
        }
    }

    // console.log(remainFiles, validLogs);
    // return [[], []];
    return [remainFiles, validLogs];
}

async function CheckFolder(CDS_folder) {
    if (!fileSync.existsSync(CDS_folder)) {
        return "not exist";
    }
    if (!(await file.lstat(CDS_folder)).isDirectory()) {
        return "not directory";
    }
    if ((await file.readdir(CDS_folder)).length < 1) {
        return "folder empty";
    }

    const path = `${CDS_folder}\\complete`

    await file.mkdir(path, {recursive: true});
    // await file.mkdir(`${path}\\files`, {recursive: true});
    await file.mkdir(`${path}\\zips`, {recursive: true});

    await file.mkdir(`${CDS_folder}\\files`, {recursive: true});
    await file.mkdir(`${CDS_folder}\\zips`, {recursive: true});
    
    return "success";
}

async function CreateFolder(CDS_folder, filePaths) {
    const folderLogs = [];
    const similarWayBill = [];
    for (let i = 0; i < filePaths.length; i++) {
        const fileName = path.basename(filePaths[i].filePath);
        let [WayBill] = fileName.split('_');

        const check_WayllBill = WayBill.split('-');
        if (check_WayllBill.length > 1) {
            WayBill = check_WayllBill[0];
        }
        const dest = `${CDS_folder}\\files\\${WayBill}`;
        
        await file.mkdir(dest, {recursive: true});
        await file.copyFile(filePaths[i].filePath, `${dest}\\${fileName}`);

        // if (!similarWayBill.includes(WayBill)) {
        //     similarWayBill.push(WayBill);
        //     folderLogs.push({folder: dest, fileName, date: filePaths[i].date});
        // }
        folderLogs.push({folder: dest, fileName, date: filePaths[i].date});
    }
    return folderLogs;
}

async function CompleteData(CDS_Folder, zipPaths, validLogs) {
    fileSync.rmSync(`${CDS_Folder}\\files`, {recursive: true, force: true});
    // fileSync.rmSync(`${CDS_Folder}\\pdf`, {recursive: true, force: true});
    
    await CompleteZips(zipPaths, validLogs, CDS_Folder);
    
    return new Promise(resolve => {
        const clearZips = setInterval(() => {
            const files = fileSync.readdirSync(`${CDS_Folder}\\zips`);
            if (files.length === 0) {
                fileSync.rmSync(`${CDS_Folder}\\zips`, {recursive: true, force: true});
                clearInterval(clearZips);
                resolve('sucess');
            }
        }, 1000)
    })
}

async function CompleteZips(zipPaths, validLogs, CDS_Folder) {
    for (let i = 0; i < zipPaths.length; i++) {
        const zipName = path.basename(zipPaths[i]);
        let duplicate = false;
        
        for (let j = 0; j < validLogs.length; j++) {
            if (validLogs[j][zipName]) {
                duplicate = true;

                // Extracting zip file from processing folder
                let src = `${CDS_Folder}\\zips\\${zipName}.zip`
                let dest = `${CDS_Folder}\\zips\\${zipName}`
                await file.mkdir(dest, {recursive: true});
                await file.copyFile(src, `${dest}\\${zipName}.zip`)
                fileSync.createReadStream(`${dest}\\${zipName}.zip`)
                        .pipe(unzipper.Extract({ path: dest }))
                        .on('close', async () => {
                            fileSync.rmSync(`${dest}\\${zipName}.zip`)
                            fileSync.rmSync(src);
                            
                            // Extracting zip file from complete folder
                            src = `${CDS_Folder}\\complete\\zips\\${zipName}.zip`;
                            await file.copyFile(src, `${dest}\\${zipName}.zip`)
                            fileSync.createReadStream(`${dest}\\${zipName}.zip`)
                                    .pipe(unzipper.Extract({ path: dest }))
                                    .on('close', async () => {
                                        fileSync.rmSync(`${dest}\\${zipName}.zip`);
                                        console.log(dest);
                                        try {
                                            await exec('zipFolder.py', dest, dest)
                                        } catch (err) {
                                            console.log('HELLO,', err)
                                        }
                                        fileSync.copyFileSync(`${dest}.zip`, src)
                                        fileSync.rmSync(dest,  {recursive: true, force: true});
                                        fileSync.rmSync(`${dest}.zip`);
                                    })
                            
                        });
                break;
            }
        }

        const dest = `${CDS_Folder}\\zips\\${zipName}.zip`
        if (!duplicate && fileSync.existsSync(dest)) {
            fileSync.copyFileSync(`${dest}`, `${zipPaths[i]}\\..\\..\\complete\\zips\\${zipName}.zip`)
            fileSync.rmSync(`${dest}`);
        }
    }
}

async function ExtractFolderToZip(folders, CDS_Folder, validLogs) {
    // console.log(validLogs, folders);
    const zipPaths = `${CDS_Folder}\\complete` 
    const zipName = 'zips';
    let duplicate = false;

    for (let i = 0; i < folders.length; i++) {
        const folderPath = folders[i];
        const files = fileSync.readdirSync(folderPath);

        files.forEach(async fileName => {
            try {
                const filePath = path.normalize(`${folderPath}\\${fileName}`);
                const destPath = path.normalize(`${CDS_Folder}\\zips\\${fileName}`);
                await file.copyFile(filePath, destPath);
            } catch (error) {
                console.log(error);
                return false;
            }
        });
    }

    const src = `${CDS_Folder}\\zips`
    const dest = `${CDS_Folder}\\complete\\${zipName}.zip`;
    if (!fileSync.existsSync(dest)) {
        console.log('REACH', dest);
        await exec('main.py', 'zipFolder', src, `${CDS_Folder}\\complete\\${zipName}`);
    }
    
    // console.log(validLogs)
    for (let j = 0; j < validLogs.length; j++) {
        if (validLogs[j][zipName]) {
            duplicate = true;

            // Extracting zip file from complete folder
            const src = `${CDS_Folder}\\complete\\${zipName}.zip`;
            const dest = `${CDS_Folder}\\zips`
            await file.copyFile(src, `${dest}\\${zipName}.zip`)
            fileSync.createReadStream(`${dest}\\${zipName}.zip`)
                    .pipe(unzipper.Extract({ path: dest }))
                    .on('close', async () => {
                        fileSync.rmSync(`${dest}\\${zipName}.zip`);
                        console.log()
                        try {
                            const tmp = await exec('main.py', 'zipFolder', dest, `${CDS_Folder}\\complete\\${zipName}`);
                            console.log(tmp);
                            fileSync.rmSync(`${CDS_Folder}\\zips`, {recursive: true});
                        } catch (err) {
                            console.log('HELLO,', err)
                        }
                    })
                        
            break;
        }
    }

    return [true, null];
}

function ExtractCompleteData(CDS_Folder) {
    fileSync.rmSync(`${CDS_Folder}\\files`, {recursive: true, force: true});
    fileSync.rmSync(`${CDS_Folder}\\pdf`, {recursive: true, force: true});

    return true;
}

function basename(file) {
    return path.basename(file)
}

async function getFileList(folders) {
    const result = [];
    // console.log(folders);
    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i].folder;
        const fileName = folders[i].fileName;
        const date = folders[i].date;

        result.push({
            filePath: `${folder}/${fileName}`, complete: false, triggerDownload: false,
            date: date
        })
    }

    return result;
}

module.exports = {
    exec, getRemainFiles, CheckFolder, CreateFolder, CompleteData, basename,
    extractRemainFiles, ExtractFolderToZip, ExtractCompleteData, getFileList
}