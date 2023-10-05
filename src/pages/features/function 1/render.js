const { ipcRenderer } = require('electron');

const button_start = document.getElementById("start");
const button_reset = document.getElementById("reset");

const CDS_Folder = document.getElementById('CDS_Folder');

const importType = document.getElementById("importType");
const exportType = document.getElementById("exportType");

// const singleBrowser = document.getElementById("singleBrowser");
// const multiBrowser = document.getElementById("multiBrowser");
const browsers = document.getElementById("browsers");

sessionStorage.clear();

async function start() {
    if (sessionStorage.getItem("CDS_folder") || sessionStorage.getItem('btn-start')) {
        return;
    }
    sessionStorage.setItem("CDS_folder", CDS_Folder.value);
    sessionStorage.setItem('btn_start', true);
    
    if (importType.checked) {
        sessionStorage.setItem('automateType', 'import');
    } else if (exportType.checked) {
        sessionStorage.setItem('automateType', 'export');
    } else {
        alert('No automate type found!');
        return false;
    }

    // if (singleBrowser.checked) {
    //     sessionStorage.setItem('optimizeType', 'single');
    // } else 
    // if (multiBrowser.checked) {
    //     sessionStorage.setItem('optimizeType', 'multi');
    // } else {
    //     alert('No optimization found!');
    //     return false;
    // }
    const total = browsers.value;
    if (total >= '1' && total <= '5') {
        sessionStorage.setItem('browsers', total);
    } else {
        alert(`Invalid number range! Your number must in range [1-5]. But you type ${total}`);
    }

    const reset_btn = button_reset.childNodes[1];

    reset_btn.className = 'btn-1-disabled'
    reset_btn.setAttribute("disabled", true);

    button_start.className = 'btn-status'
    button_start.innerHTML = `
    <div class="loading-group">
        <div class="spinner" style="font-size: 18px"></div>
    </div>
    <span class="status-title btn-pending">Pending</span>
    `
    
    setTimeout(() => {
        window.location.replace("./display.html");
    }, 400);
};

async function reset() {
    if (sessionStorage.getItem("btn_reset")) {
        return;
    }
    sessionStorage.setItem('btn_reset', true);
    console.log()

    const start_btn = button_start.childNodes[1];

    start_btn.className = 'btn-1-disabled'

    button_reset.className = 'btn-status'
    button_reset.innerHTML = `
    <div class="loading-group">
        <div class="spinner" style="font-size: 18px"></div>
    </div>
    <span class="status-title btn-pending">Pending</span>
    `

    setTimeout(() => {
        sessionStorage.clear();
        location.reload();
    }, 400)
}

function selectFolder_as(e) {
    e.preventDefault();
    // Send a message to the main process to show the folder selection dialog
    ipcRenderer.invoke('show-open-dialog').then(result => {
        // Handle selected folder path as needed
        if (result && result.length > 0) {
            console.log("Selected folder:", result[0]);
            // Update UI element with selected folder path if needed
            CDS_Folder.value = result[0]
        }
      }).catch(err => {
        console.log("Error selecting folder:", err);
      });
}