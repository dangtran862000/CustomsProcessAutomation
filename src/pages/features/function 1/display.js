const CDS_Folder = sessionStorage.getItem("CDS_folder");
const automateType = sessionStorage.getItem('automateType');
const optimizeType = sessionStorage.getItem('optimizeType');
const browsers = Number(sessionStorage.getItem('browsers'));

const SPINNER_SUCCESS = `<div class="checkmark active">&#10003;</div>`;
const SPINNER_WARNING = `<div class="checkmark warning fas">&#xf071;</div>`;
const SPINNER_FAILED = `<div class="checkmark failed">&#10008;</div>`

const STATUS_SUCCESS = 'success';
const STATUS_WARNING = 'warning';
const STATUS_FAILED = 'failed';
const STATUS_ERROR_WARNING = 'error-warning';
const STATUS_ERROR_FAILED = 'error-failed';

// Has bug
function copy(id, tooltip) {
    let copyText = document.getElementById(id);
    let copySuccess = document.getElementById(tooltip);
    navigator.clipboard.writeText(copyText.innerText);

    const className = copySuccess.className;
    if (className) {
        // Change css
        copySuccess.className = '';
        const btn = copySuccess.childNodes[1]
        btn.className = 'copied-btn';
        const i = btn.childNodes[1];
        i.className = 'fas fa-check';

        setTimeout(function(){ 
            copySuccess.className = className;
            const btn = copySuccess.childNodes[1]
            btn.className = 'copy-btn';
            const i = btn.childNodes[1];
            i.className = 'fas fa-copy';
        }, 2000);
    }
}

function back() {
    sessionStorage.clear();
    location.replace('./index.html');
}


function getStatusHTML(args) {
    const {html, cssClass, text} = args;

    return `
    <div class="status">
        <div class="loading-group">
            ${html}
        </div>
        <span class="status-title ${cssClass}">${text}</span>
    </div>
    `
}

function getHTML(status) {
    if (status === STATUS_SUCCESS) {
        return {
            cssClass: 'active',
            html: SPINNER_SUCCESS,
            text: 'Success'
        }
    }

    if (status === STATUS_WARNING) {
        return {
            cssClass: 'warning',
            html: SPINNER_WARNING,
            text: 'Warning'
        } 
    }

    if (status === STATUS_FAILED) {
        return {
            cssClass: 'failed',
            html: SPINNER_FAILED,
            text: 'Failed'
        } 
    }

    if (status === STATUS_ERROR_WARNING) {
        return {
            cssClass: 'note-warning',
            title: 'Warning'
        }
    }

    if (status === STATUS_ERROR_FAILED) {
        return {
            cssClass: 'note-important',
            title: 'Failed'
        }
    }
    
    throw Error('Not implemented type!');
}

function changeProgressHTML(args) {
    const {node, noteCol, passedCol, statusCol} = args;
    const note = node.childNodes[5];
    const passed = node.childNodes[7];
    const status = node.childNodes[9];

    if (noteCol) {
        note.innerHTML = `<p>${noteCol}</p>`
    }
    if (statusCol) {
        status.innerHTML = getStatusHTML(statusCol);
    }
    passed.innerHTML = passedCol || `-/-`;
}

function changeQuantityHTML(args) {
    const {node, passedCol} = args;
    const passed = node.childNodes[7];
    passed.innerHTML = passedCol;
}

function getErrorTraceHTML(args) {
    const {defaultHTML, step, description, ID} = args;
    const {cssClass, title} = defaultHTML;

    return `<div class="single-note-item all-category ${cssClass}">
    <div class="card card-body">
        <span class="side-stick"></span>
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="brand-version warning" style="font-size: 17px;">Error Trace</span>
            <p class="note-date font-12 text-muted">No #${step}</p>
          </div>
          <div class="status">
            <div class="loading-group">
              <div class="checkmark warning fas">&#xf071;</div>
            </div>
            <span class="status-title warning">${title}</span>
          </div>
        </div>
        <div>
            <p class="note-inner-content text-muted note-content" data-notecontent="Blandit tempus porttitor aasfs. Integer posuere erat a ante venenatis.">
                ${description}
            </p>
            <ul class="list-group" id='${ID}'>
                
            </ul>
        </div>
    </div>
  </div>`
}

function showErrorListHTML(args) {
    const {node, errors, step} = args;
    errors.forEach((data, i) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
        <span id="${step}-${i}">${data}</span>
        <span class="clipboard clipboard--top" style="font-size: 18px;" data-tooltip="Copy file name" id="tooltip-${step}-${i}">
            <button class="copy-btn" id="copyButton" onclick="copy('${step}-${i}', 'tooltip-${step}-${i}')">
                <i class="fas fa-copy"></i>
            </button>
        </span>`
        node.appendChild(li);
    });
}

function showErrorTraceHTML(args) {
    const {node, errors = [], step} = args;
    const newID = `${step}-${node.id}`;
    node.innerHTML = getErrorTraceHTML({...args, ID: newID});

    if (errors.length < 1) {
        return;
    }

    const list = document.getElementById(newID);
    showErrorListHTML({node: list, errors, step})
}





// Step 1
async function CheckFolder() {
    const checkFolder_ele = document.getElementById("checkFolder");
    // const result = await window.function_1.exec('1_checkFolder.py', path);
    const status = await window.function_1.CheckFolder(CDS_Folder);

    if (status === 'success') {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'Ready to process folder',
            statusCol: html
        })
        return true;
    }

    if (status === 'not exist') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'The folder not exist',
            statusCol: html
        })

        return false;
    }

    if (status === 'not directory') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'The path not a directory',
            statusCol: html
        })
        return false;
    }

    if (status === 'folder empty') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'The folder is empty',
            statusCol: html
        })
        return false;
    }

    throw Error("Missing cases for CheckFolder step (1)");
}

// Step 2
async function CheckFiles(files) {
    const checkFiles_ele = document.getElementById('checkFiles');
    const errorTrace_ele = document.getElementById('error-trace-2');
    const path = CDS_Folder;
    const fileNames = files.map(file => file.fileName);

    // Faster but no real-time display
    const result = await window.function_1.exec('main.py', 'checkFiles_2', path, ...fileNames);
    // console.log(result);
    const length = Math.floor((result.length) / 3);
    successFiles = []
    for (let i = 0, j = 0; j < length; i+=3, j++) {
        if (result[i + 2] === 'True') {
            files[j].date = result[i + 1];
            successFiles.push(files[j]);
        }
    }

    if (successFiles.length === files.length) {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: checkFiles_ele,
            noteCol: 'File name match data inside the file',
            passedCol: `${successFiles.length}/${files.length}`,
            statusCol: html
        });
        return successFiles;
    } else {
        const html = getHTML(STATUS_WARNING);
        changeProgressHTML({
            node: checkFiles_ele,
            noteCol: 'Some files are invalid format',
            passedCol: `${successFiles.length}/${files.length}`,
            statusCol: html
        });

        const htmlData = getHTML(STATUS_ERROR_WARNING);
        const errorFiles = window.function_1.extractRemainFiles(files, successFiles).map(file => file.fileName);
        showErrorTraceHTML({
            defaultHTML: htmlData,
            node: errorTrace_ele,
            step: 2,
            description: 'Some of the files may have wrong format. Please check the file name again or verify the data inside the file such that it must be consistent. Below are the error files:',
            errors: errorFiles
        });

        return successFiles;
    }

    throw Error(`Some cases is not implemented! Please implement that case <${result[0]}>`)
}

// Step 3
async function CreateFolder(files) {
    const createFolder_ele = document.getElementById("createFolders");
    const fixedPath = CDS_Folder;
    const filePaths = files.map(file => ({...file, filePath: `${fixedPath}\\${file.fileName}`}))
    // const filePaths = files;
    
    const result = await window.function_1.CreateFolder(fixedPath, filePaths);
    // console.log(result);

    const html = getHTML(STATUS_SUCCESS);
    changeProgressHTML({
        node: createFolder_ele,
        noteCol: 'Create CDS sub-folder for each CDS file',
        passedCol: `${result.length}/${result.length}`,
        statusCol: html
    });
    return result;

    // throw Error(`Missing cases of CreateFolder step (3) - ${result[0]}`)
}

// Step 4
async function WebScrapping_1(folders) {
    // if (optimizeType === "single") {
    //     return await WebScrapping_1_1(folders);
    // } else 
    // if (optimizeType === 'multi') {
    //     return await WebScrapping_1_2(folders);
    // } else {
    //     alert("No Optimization found");
    // }
    return await WebScrapping_1_2(folders, browsers);
}

// Step 4 - Benchmark 1
async function WebScrapping_1_1(files) {
    const webScrapping_1_ele = document.getElementById('webScraping1');
    const path = CDS_Folder;

    changeProgressHTML({
        node: webScrapping_1_ele,
        noteCol: 'Download PDF file from website',
        passedCol: `0/${files.length}`,
    });

    const length = files.length * 2;
    const filesFinal = [...new Array(length).map((_, i) => i)];
    for (let i = 0, j = 0; i < files.length; i++, j+=2) {
        filesFinal[j] = files[i].fileName
        filesFinal[j + 1] = files[i].date
    }
    const result =  await window.function_1.exec('main.py', 'webScrapping1_4', path, ...filesFinal);
    console.log(result);

    const html = getHTML(STATUS_SUCCESS);
    changeProgressHTML({
        node: webScrapping_1_ele,
        passedCol: `${result.length}/${files.length}`,
        statusCol: html
    });

    return result;
}

// Step 4 - Benchmark 2
async function WebScrapping_1_2(files, perSeg) {
    const webScrapping_1_ele = document.getElementById('webScraping1');
    const errorTrace_ele = document.getElementById('error-trace-4');
    const path = CDS_Folder;

    changeProgressHTML({
        node: webScrapping_1_ele,
        noteCol: 'Download PDF file from website',
        passedCol: `0/${files.length}`,
    });

    // const perSeg = 5;
    const size = files.length;
    const isEqual = size % perSeg === 0;
    const remains = Math.floor(size / perSeg); 
    const totalSeg = isEqual ? remains : remains + 1;
    let segments = [...new Array(totalSeg)].map(() => []);
    const result = [];

    for (let j = 0, z = 0; j < size; j+=perSeg) {
        for (let i = 0; i < perSeg; i++) {
            if (files[i + j]) {
                segments[z].push(files[i+j]);
            }
        }

        let fileFinal = segments[z];
        fileFinal = fileFinal.map(file => ({...file, complete: false, triggerDownload: false}))
        fileFinal = JSON.stringify(fileFinal);
        const folders = await window.function_1.exec('main.py', 'webScrapping2_4', path, fileFinal);
        z++;
        
        folders.forEach(folder => {
            result.push(folder);
        })

        changeProgressHTML({
            node: webScrapping_1_ele,
            passedCol: `${result.length}/${files.length}`,
        });
    }

    if (result.length === files.length) {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: webScrapping_1_ele,
            passedCol: `${result.length}/${files.length}`,
            statusCol: html
        });
        return result;
    } else {
        const html = getHTML(STATUS_WARNING);
        changeProgressHTML({
            node: webScrapping_1_ele,
            noteCol: 'Some files are not downloaded',
            passedCol: `${result.length}/${files.length}`,
            statusCol: html
        });

        const htmlData = getHTML(STATUS_ERROR_WARNING);
        let errorFiles = [];
        const reducedFiles = files.map(file => file.fileName);
        for (let i = 0; i < reducedFiles.length; i++) {
            let isMatch = false;
            for (let j = 0; j < result.length; j++) {
                let fileName = result[j].split("\\");
                fileName = fileName[fileName.length - 1];
                if (reducedFiles[i].startsWith(fileName)) {
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                errorFiles.push(reducedFiles[i]);
            }
        }
        showErrorTraceHTML({
            defaultHTML: htmlData,
            node: errorTrace_ele,
            step: 4,
            description: "Some of the pdf files are not downloaded. Please check the content of those file. In case if it's correct, the network might be the cause for not downloading the pdf files.",
            errors: errorFiles
        });
        return result;
    }
}

// Step 4 - Benchmark 3
async function WebScrapping_1_3(folders) {
    const webScrapping_1_ele = document.getElementById('webScraping1');
    const path = CDS_Folder;

    changeProgressHTML({
        node: webScrapping_1_ele,
        noteCol: 'Download PDF file from website',
        passedCol: `0/${folders.length}`,
    });

    let files = folders.map(file => ({...file, complete: false, triggerDownload: false}))
    files = JSON.stringify(files)
    const result = await window.function_1.exec('webScrapping3_4.py', path, files);

    const html = getHTML(STATUS_SUCCESS);
    changeProgressHTML({
        node: webScrapping_1_ele,
        passedCol: `${result.length}/${files.length}`,
        statusCol: html
    });

    return result;
}

// Step 5
async function ImportCompressFolder(folders) {
    const compressFolder_ele = document.getElementById('compressFolder');
    const path = CDS_Folder;
    const tmp = {};
    for (let i = 0; i < folders.length; i++) {
        const name = window.function_1.basename(folders[i]);
        tmp[name] = folders[i];
    }
    let passedFolders = []
    for (const [, val] of Object.entries(tmp)) {
        passedFolders.push(val)
    }

    const result = await window.function_1.exec('main.py', 'compressToZip_5', path, ...passedFolders);
    // console.log(result);

    const passedZips = result.slice(1);
    if (result[0] === 'success') {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: compressFolder_ele,
            noteCol: 'Compress all sub-folders into zip',
            passedCol: `${passedZips.length}/${passedFolders.length}`,
            statusCol: html
        });
        return [true, passedZips];
    }

    throw Error(`Missing cases of CompressFolder step (5) - ${result[0]}`)
}

async function ExportCompressFolder(folders, validLogs) {
    const compressFolder_ele = document.getElementById('compressFolder');
    // const path = CDS_Folder;
    // console.log(validLogs)
    const [status, path] = await window.function_1.ExtractFolderToZip(folders, CDS_Folder, validLogs);
    // console.log('REACH') 

    if (status) {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: compressFolder_ele,
            noteCol: 'Compress all sub-folders into zip',
            passedCol: `1/1`,
            statusCol: html
        });
    } else {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: compressFolder_ele,
            noteCol: 'Compress all sub-folders into zip',
            passedCol: `0/1`,
            statusCol: html
        });
    }

    if (status) {
        return [status, path];
    } 
}

// Step 6
async function SendEmail(zips) {
    const sendEmail_ele = document.getElementById('sendEmail');
    const sendEmailTrace_ele = document.getElementById('error-trace-6');
    const path = CDS_Folder;

    // const result = await window.function_1.exec('6_sendEmail.py')
    const html = getHTML(STATUS_WARNING);
    changeProgressHTML({
        node: sendEmail_ele,
        noteCol: 'Not Implemented',
        statusCol: html
    });
    const htmlData = getHTML(STATUS_ERROR_WARNING);
    showErrorTraceHTML({
        defaultHTML: htmlData,
        node: sendEmailTrace_ele,
        step: 6,
        description: 'The current step of sending email file to stakeholders is not available. This is not an error, it is just not implemented by the IT department yet. Please wait for the available version.',
    });
    return [true, zips]
}

// Step 7-1
async function ImportCleanUp(zips, validLogs) {
    const cleanup_ele = document.getElementById('cleanup');

    const result = await window.function_1.CompleteData(CDS_Folder, zips, validLogs); 

    const html = getHTML(STATUS_SUCCESS);
    changeProgressHTML({
        node: cleanup_ele,
        noteCol: 'Clean up successfully',
        statusCol: html
    })
}


// Step 7-2
async function ExportCleanUp() {
    const cleanup_ele = document.getElementById('cleanup');

    const result = window.function_1.ExtractCompleteData(CDS_Folder);

    const html = getHTML(STATUS_SUCCESS);
    changeProgressHTML({
        node: cleanup_ele,
        noteCol: 'Clean up successfully',
        statusCol: html
    })
}



// Test Python.exe
async function TestPythonExe() {
    const sendEmail_ele = document.getElementById('test');

    // const result = await window.function_1.exec('dist/TestExec.exe')
    const result2 = await window.function_1.load('dist/TestExec.exe')
}




async function ImportProcess(folders, remainFiles, validLogs) {
    let [passStep5, zips] = await ImportCompressFolder(folders, remainFiles);

    await ImportCleanUp(zips, validLogs);
}

async function ExportProcess(folders, validLogs) {
    let [pass, zips] = await ExportCompressFolder(folders, validLogs);

    await ExportCleanUp();
}


(async () => {
    var startTime = performance.now()

    let success = await CheckFolder();
    if (!success) {
        return false;
    }

    const [remainFiles, validLogs] = await window.function_1.getRemainFiles(CDS_Folder, automateType);
    
    let files = await CheckFiles(remainFiles);

    let folders = await CreateFolder(files);

    folders = await WebScrapping_1(folders);

    folders = new Set(folders);
    folders = Array.from(folders);
    if (automateType === 'import') {
        await ImportProcess(folders, remainFiles, validLogs);
    }
    if (automateType === 'export') {
        await ExportProcess(folders, validLogs);
    }

    var endTime = performance.now()

    console.log(`Took ${endTime - startTime} milliseconds`)
})();
