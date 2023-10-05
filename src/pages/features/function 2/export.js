
// async function start() {
//     // Ví dụ để lấy kết quả từ python 
//     const data = await window.function_2.exec('example.py');
//     document.getElementById("demo").innerHTML = data[1];
//     console.log(data[1]);
// }

// async function submit() {
    
//     const input = document.getElementById('to').value;
//     var inputFile = document.getElementById('fileInput').value;
//     var filePath = inputFile.files[0].path;


//     // Ví dụ để truyền tham số qua python 
//     // Thêm bao nhiêu tham số đều được - không giới hạn
//     const data = await window.function_2.exec('another.py', input, filePath)
//     console.log(data);

//     document.getElementById("demo").innerHTML = data[1];

// }

let {PythonShell} = require('python-shell')
var path = require("path");
const { argv, electron } = require('process');
const { ipcRenderer } = require('electron');

// async function start_test() {
//   // Ví dụ để lấy kết quả từ python 
//   const data = await window.function_2.exec('main.py');
//   console.log(data);
// }

// async function start() {
//   // Ví dụ để lấy kết quả từ python 
//   const data = await window.browse_button(filePath).exec('export.py');
//   console.log(data);
//   const dataShippingDocs = await window.browse_button(ShippingDocsPath).exec('export.py');
//   console.log(dataShippingDocs);
// }


function myFunction() {
  if (confirm("WARNING !!! \n\nPlease close all the Excel Application during using this tool!!! \n\nSAVE YOUR EXCEL SHEET AND CLOSE ALL THE EXCEL APPLICATION !!!\n\nClick 'OK' if you want to run the tool!!!", "WARNING") == false) {
    return false;
  } else {
    return true;
  }
}


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

function createErrorTrace(errorNo, errorMessage, errorFileName) {
  const elementErrorTrace = document.createElement("div");
  elementErrorTrace.innerHTML += `<div class="single-note-item all-category note-warning">
  <div class="card card-body">
      <span class="side-stick"></span>
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <span class="brand-version warning" style="font-size: 17px;">Error Trace</span>
          <p class="note-date font-12 text-muted">No. ${errorNo}</p>
        </div>
        <div class="status">
          <div class="loading-group">
            <div class="checkmark warning fas">&#xf071;</div>
          </div>
          <span class="status-title warning">Warning</span>
        </div>
      </div>
      <div>
          <p class="note-inner-content text-muted note-content" data-notecontent="Blandit tempus porttitor aasfs. Integer posuere erat a ante venenatis.">
            ${errorMessage}
            . Below are the error files:
          </p>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span id="fileName-${errorNo}">${errorFileName}</span>
              
              <span class="clipboard clipboard--top" style="font-size: 18px;" data-tooltip="Copy file name" id="tooltip-${errorNo}">
                <button class="copy-btn" id="copyButton" onclick="copy('fileName-${errorNo}', 'tooltip-${errorNo}')">
                  <i class="fas fa-copy"></i>
                </button>
              </span>
            </li>
          </ul>
      </div>
  </div>
</div>`;
  // Append to another element:
  document.getElementById("error-trace").appendChild(elementErrorTrace);
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

async function selectFolderShippingDocs(e) {
  // Send a message to the main process to show the folder selection dialog
  ipcRenderer.invoke('show-open-dialog').then(result => {
      // Handle selected folder path as needed
      if (result && result.length > 0) {
        const folderPath = result[0] + "\\";
        console.log("Selected folder:", folderPath);
      // Update UI element with selected folder path if needed
        document.getElementById('folderShippingDocInput').innerHTML = folderPath;
        document.getElementById('folderShippingDocInput').value = folderPath;
      }
    }).catch(err => {
      console.log("Error selecting folder:", err);
    });
}

async function selectFolderBill(e) {
  // Send a message to the main process to show the folder selection dialog
  ipcRenderer.invoke('show-open-dialog').then(result => {
      // Handle selected folder path as needed
      if (result && result.length > 0) {
        const folderPath = result[0] + "\\";
        console.log("Selected folder:", folderPath);
      // Update UI element with selected folder path if needed
        document.getElementById('folderWBInput').innerHTML = folderPath;
        document.getElementById('folderWBInput').value = folderPath;
      }
    }).catch(err => {
      console.log("Error selecting folder:", err);
    });
}

// function getFolderPath(filePath){
//   if(fs.lstatSync(filePath).isDirectory()){
//       // Case testing if the folder is empty
//       return filePath
//   } else {
//       var folder = filePath.split("\\");
//       let splicedStr = folder.slice(0, folder.length - 1).join("\\") + "\\";
//       return splicedStr
//   }
// }

async function submit() {
  

  document.getElementById("errorInput").style.visibility="hidden";
  document.getElementById("errorSD").style.visibility="hidden";
  document.getElementById("errorCDS").style.visibility="hidden";
  document.getElementById("errorWB").style.visibility="hidden";

  confirmExcel = myFunction()
  // console.log(confirmExcel)
  if(confirmExcel == false) {
    return;
  };

  const input = document.getElementById('to').value;

  var fileInput = document.getElementById('filePath').value;

  var fileShippingDocsInput = document.getElementById('folderShippingDocInput').value;

  var folderWBInput = document.getElementById('folderWBInput').value;
  
  try {
    if (fileInput == "") {
      var filePath = "";
    } else {
      var filePath = fileInput;
    }
  }
  catch{
    var filePath = "";
  }

  try {
    if (fileShippingDocsInput == "") {
      var ShippingDocsPath = "";
    } else {
      var ShippingDocsPath = fileShippingDocsInput;
    }
  }
  catch{
    var ShippingDocsPath = "";
  }

  try {
    
    if (folderWBInput == "") {
      var folderWB = "";
    } else {
      var folderWB = folderWBInput;
    }
  }
  catch{
    var folderWB = "";
  }
  
  // console.log(folderWB)

  try {
    // if ((input == "") && (filePath == "") && (ShippingDocsPath == "")) throw "ERROR !!! \n\nCDS files, shipping docs and PIC name is empty !!! You are required to input all the information";
    // if ((input == "") && (filePath == "")) throw "ERROR !!!\n \nCDS files, and PIC is empty !!! You are required to input PIC name, and browse the CDS folder";
    // if ((input == "") && (ShippingDocsPath == "")) throw "ERROR !!! \n \nShipping docs files, and PIC is empty !!! You are required to input PIC name, and browse the shipping docs folder";
    // if ((filePath == "") && (ShippingDocsPath == "")) throw "ERROR !!!\n \nShipping docs files, and CDS files is empty !!! You are required to browse the CDS folder, and browse the shipping docs folder";
    // if ((filePath == "")) throw "ERROR !!!\n \nCDS files is empty !!! You are required to browse the CDS folder";
    if ((ShippingDocsPath == "")) throw 1;
  } catch (error) {
    // alert(error,'alert');
    if (error == 1) {
      document.getElementById("errorSD").style.visibility="visible";
    }
  }

  try {
    if ((filePath == "")) throw 1;
  } catch (error) {
    // alert(error,'alert');
    if (error == 1) {
      document.getElementById("errorCDS").style.visibility="visible";
    }
  }
  
  try {
    if ((folderWB == "")) throw 1;
  } catch (error) {
    // alert(error,'alert');
    if (error == 1) {
      document.getElementById("errorWB").style.visibility="visible";
    }
  }  

  try {
    if ((input == "")) throw 1;
  } catch (error) {
    // alert(error,'alert');
    if (error == 1) {
      document.getElementById("errorInput").style.visibility="visible";
      return;
    } else {
      document.getElementById("errorInput").style.visibility="hidden";
    }
  } 
  
  
  var options = {
    scriptPath :'./', 
    args : [to, filePath, ShippingDocsPath, folderWB]
  }

  // let pyshell = new PythonShell('main.py', options);

  // pyshell.on('message', function(message) {
  //   swal(message);
  //   const messageList = [];
  //   messageList.push(message)
  //   // console.log(messageList)
  // }, )
  
  
  document.getElementById("to").value = "";
  // document.getElementById('filePath').files[0].path = "";
  document.getElementById('folderShippingDocInput').value = "";
  document.getElementById('folderWBInput').value = "";

  var fs = require('fs');
  const onlyPath = filePath;
  // console.log(onlyPath + " /Test")
  var files = fs.readdirSync(onlyPath)
  const listFiles = [];

  for (let i = 0; i < files.length; i++) {
    if ((files[i].split(".")[1] == "xls") || (files[i].split(".")[1] == "xlsx")) {
      if ((files[i].split(".")[0].indexOf("~$"))< 0) {
        // console.log(files[i].split(".")[0])
        listFiles.push(onlyPath +"/"+ files[i])
      }
    }
  }

  if (listFiles.length == 0) {
    document.getElementById("loading").style.display = "none";
  }

  var ErrorCount = 0;
  var SuccessCount = 0;
  
  for (let i = 0; i < listFiles.length; i++) {
    document.getElementById("loading").style.display= "inline";
    document.getElementById("display_input").style.display="none";
    document.getElementById("countTable").style.display= "block";
    document.getElementById("error").innerHTML = ErrorCount;
    document.getElementById("sucess").innerHTML = SuccessCount;
    document.getElementById("totalCDS").innerHTML = listFiles.length;
    document.getElementById("totalCDS1").innerHTML = listFiles.length;
    document.getElementById("createNewButton").style.display = "block";

    // console.log(listFiles)
    filePathInput = listFiles[i]

    const data = await window.function_2.exec('main.py', 'export', input, filePathInput, ShippingDocsPath, folderWB)
    len = data.length;
    // console.log(ErrorCount)
    console.log(data)
    if  (data[0] != null) {
      // document.getElementById("demo").style.display = "block"
    } 
    if (data[0] == "Tao CDS package thanh cong !!!") {
      SuccessCount = SuccessCount + 1;
      document.getElementById("loading").style.display = "inline";
    } else {
      document.getElementById("loading").style.display = "inline";
      ErrorCount = ErrorCount + 1;
      createErrorTrace(ErrorCount,data[0],data[1])
      const para = document.createElement("i");
      para.style.color = "red";
      para.innerText = "\n"+ data[0] + "\n";
      // console.log(data[0])
      document.getElementById("noteError").appendChild(para);
    }
    if (i == (listFiles.length - 1)) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("status_process").innerHTML = "Done"; 
      const para = document.createElement("i");
      para.innerText = "\n";
      document.getElementById("noteError").appendChild(para);
      // document.getElementById("demo").style.color = "green";
      // document.getElementById("demo").innerHTML = "FINISH CREATE CDS PACKAGE !!!";
    }
  }
  document.getElementById("sucess").innerHTML = SuccessCount; 
  document.getElementById("error").innerHTML = ErrorCount; 
}