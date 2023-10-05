const { fileURLToPath } = require("url");
// const fs = require('fs');
const Swal = require('sweetalert2');
const { ipcRenderer } = require('electron');

async function start() {
    // Ví dụ để lấy kết quả từ python
    const data = await window.function_4.exec('example.py');
    console.log(data);
}

async function submit() {

    var flagCondition = await Swal.fire({
        title: 'Do you use the right account?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isDenied) {
            return false
        }
      })
    
    console.log(flagCondition)

    // Checking if the username, password and tax_code is provided
    const conditions = await Promise.all([checkSettings("username"), checkSettings("password"), checkSettings("taxcode")]);

    const allConditions = conditions.every(condition => condition);

    if (flagCondition != false) {
        if(!checkExists("filePath")) {
            alert("The file path is empty, please provide!")
        } else if (!checkExists("numberCodes")) {
            alert("The number of identifier code is empty, please provide!")
        }
        else if(!allConditions) {
            alert("The required information is empty. \n \nGo to settings page for configuration")
        }
        else {
            const folder = document.getElementById('filePath').value;
            const numberOfCodes = document.getElementById('numberCodes').value;
            const product = document.querySelector('input[name="product"]:checked').value;
            const target = document.querySelector('input[name="target"]:checked').value;
            // if (sessionStorage.getItem("folderPath") || sessionStorage.getItem('btn_reset')) {
            //     return;
            // }
            sessionStorage.setItem("folderPath", folder);
            // if (sessionStorage.getItem("numberOfCodes") || sessionStorage.getItem('btn_reset')) {
            //     return;
            // }
            sessionStorage.setItem("numberOfCodes",numberOfCodes);
            sessionStorage.setItem("product",product);
            sessionStorage.setItem("target",target);
            setTimeout(() => {
                window.location.replace("./display.html");
            }, 400)
            // const data = await window.function_4.exec('main.py', folder, numberOfCodes, product, target);
            // console.log(data)
        }
    }

}


async function selectFolder(e) {
    // Send a message to the main process to show the folder selection dialog
    ipcRenderer.invoke('show-open-dialog').then(result => {
        // Handle selected folder path as needed
        if (result && result.length > 0) {
          const folderPath = result[0] + "\\";
          console.log("Selected folder:", folderPath);
        // Update UI element with selected folder path if needed
          document.getElementById('filePath').innerHTML = folderPath;
          document.getElementById('filePath').value = folderPath;
        }
      }).catch(err => {
        console.log("Error selecting folder:", err);
      });
}

function getFolderPath(filePath){
    if(fs.lstatSync(filePath).isDirectory()){
        // Case testing if the folder is empty
        return filePath
    } else {
        var folder = filePath.split("\\");
        let splicedStr = folder.slice(0, folder.length - 1).join("\\") + "\\";
        return splicedStr
    }
}

function checkExists(value){
    var myInput = document.getElementById(value);
    console.log(document.getElementById(value).value)
    if (!(myInput && myInput.value)) {
        return false;
    }
    return true;
}

async function checkSettings(value){
    // Check if file exists
    try {
        const data = fs.readFileSync('./data.json');
        var config = JSON.parse(data);
        // Check if the required file is available
        if(config[value]){
            return true;
        }
        return false;
      }
    catch (err) {
        return false
    }
}

function alert(txt){
    return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: txt,
        confirmButtonColor: "#3085d6"
    })
}