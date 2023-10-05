const filePath = sessionStorage.getItem("folderPath");
const numberOfCodes = sessionStorage.getItem("numberOfCodes");
const target = sessionStorage.getItem("target");
const product = sessionStorage.getItem("product");

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

function back() {
    sessionStorage.clear();
    window.location.replace('./index.html');
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

    note.innerHTML = `<p>${noteCol}</p>`
    passed.innerHTML = passedCol || `-/-`;
    status.innerHTML = getStatusHTML(statusCol);
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
async function checkStatus() {
    const checkFiles_ele = document.getElementById('checkStatus');

    const result = await window.function_4.exec('main.py', 'checkStatus');
    console.log(result);

    if (result[0] === 'success') {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: checkFiles_ele,
            noteCol: 'Ready to scrape',
            statusCol: html
        });
        return true
    }

    if (result[0] === 'error') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFiles_ele,
            noteCol: 'Website is currently down',
            statusCol: html
        })
        return false
    }
}


// Step 2
async function webScarping() {

    const checkFolder_ele = document.getElementById("webScarping");
    const status =  await window.function_4.exec('main.py', 'webScraping', filePath, numberOfCodes, product, target);
    const errorTrace_ele = document.getElementById('error-trace-2');

    console.log(status);
    if (status[status.length - 2] === 'success') {
        const html = getHTML(STATUS_SUCCESS);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: "End process",
            passedCol: `${status[status.length - 1]}/${numberOfCodes}`,
            statusCol: html
        })
        return true;
    }

    if (status[status.length - 2] === 'failure') {
        const html = getHTML(STATUS_WARNING);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: "End process",
            passedCol: `${status[status.length - 1]}/${numberOfCodes}`,
            statusCol: html
        })

        const htmlData = getHTML(STATUS_ERROR_WARNING);
        showErrorTraceHTML({
            defaultHTML: htmlData,
            node: errorTrace_ele,
            step: 2,
            description: 'Not get enough codes',
            errors: `${status[status.length - 1]}/${numberOfCodes}`
        });


        return true;
    }

    if (status[0] === 'Failed to login') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'Failed to login',
            statusCol: html
        })

        return false;
    }

    if (status[0] === 'Failed to handle captcha') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'Failed to handle captcha',
            statusCol: html
        })
        return false;
    }

    if (status[0] === 'Failed process') {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'Failed process due to software',
            statusCol: html
        })
        return false;
    }

    else {
        const html = getHTML(STATUS_FAILED);
        changeProgressHTML({
            node: checkFolder_ele,
            noteCol: 'Error due to software',
            statusCol: html
        })
        return false;
    }
}

(async () => {

    let success1 = await checkStatus();
    if (!success1) {
        return false;
    }

    let success2 = await webScarping();
    if (!success2) {
        return false;
    }

})();
