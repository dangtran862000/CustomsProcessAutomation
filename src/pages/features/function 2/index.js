
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
const { argv } = require('process');

async function start() {
  // Ví dụ để lấy kết quả từ python 
  const data = await window.browse_button(filePath).exec('another.py');
  console.log(data);
  const dataShippingDocs = await window.browse_button(ShippingDocsPath).exec('another.py');
  console.log(dataShippingDocs);
}

async function submit() {
  
  const input = document.getElementById('to').value;

  var fileInput = document.getElementById('fileInput');

  var fileShippingDocsInput = document.getElementById('folderShippingDocInput');

  try {
    var filePath = fileInput.files[0].path;
    var ShippingDocsPath = fileShippingDocsInput.files[0].path;

    if (input == "") {
        document.getElementById("demo").style.display = "block"
        document.getElementById("demo").innerHTML = "Please input the PIC name !!!"
    }
    else {
        document.getElementById("demo").style.display = "none"
        document.getElementById("loading").style.display = "block";
        document.getElementById("demo").innerHTML = ""
    }
  }
  catch(err) {
    if (input == "") {
        document.getElementById("demo").style.display = "block"
        document.getElementById("demo").innerHTML = "Please browse the CDS file and input the PIC name !!!"
    } else {
        document.getElementById("demo").style.display = "block"
        document.getElementById("demo").innerHTML = "Please browse the CDS file !!!"
    } 
  }
  

  var options = {
    scriptPath :'./', 
    args : [to, filePath, ShippingDocsPath]
  }

  let pyshell = new PythonShell('another.py', options);

  pyshell.on('message', function(message) {
    swal(message);
    const messageList = [];
    messageList.push(message)
    console.log(messageList)
  }, )
  
  
  document.getElementById("to").value = "";
  document.getElementById('fileInput').files[0].path = "";
  document.getElementById('folderShippingDocInput').files[0].path = "";

  var fs = require('fs');
  const onlyPath = require('path').dirname(filePath);
  var files = fs.readdirSync(onlyPath)
  const listFiles = [];

  for (let i = 0; i < files.length; i++) {
    if ((files[i].split(".")[1] == "xls") || (files[i].split(".")[1] == "xlsx")) {
      listFiles.push(onlyPath +"/"+ files[i])
    }
  }

  if (listFiles.length == 0) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("demo").style.display = "block";
    document.getElementById("demo").innerHTML = "No CDS files found! Please try your folder again!"
  }

  var ErrorCount = 0;
  
  
  for (let i = 0; i < listFiles.length; i++) {
    document.getElementById("display_input").style.display="none";
    document.getElementById("dataCount").style.display= "block";
    document.getElementById("dataCount").innerHTML = ErrorCount +" / "+listFiles.length;
    console.log(listFiles)
    filePathInput = listFiles[i]

    const data = await window.function_2.exec('another.py', input, filePathInput, ShippingDocsPath)
    len = data.length;
    console.log(data)
    if  (data[0] != null) {
      document.getElementById("demo").style.display = "block"
      // document.getElementById("demo").innerHTML = data[0];
    } if (data[0] == "Tao CDS package thanh cong !!!") {
        if (i == (listFiles.length - 1)) {
          document.getElementById("loading").style.display = "none";
          document.getElementById("demo").style.display = "block";
          document.getElementById("demo").innerHTML = data[0];
          // document.getElementById("view").style.display = "block";
          document.getElementById("demo").style.color = "green";
          document.getElementById("demo").innerHTML = "FINISH CREATE CDS PACKAGE !!!";
          document.getElementById("createNewButton").style.display = "block";
        } else {
          document.getElementById("loading").style.display = "block";
        }
      } else {

        document.getElementById("loading").style.display = "block";
        const para = document.createElement("i");
        ErrorCount += 1;
        para.style.color = "red";
        para.innerText = data[0] + "\n";
        document.getElementById("message").appendChild(para);
        document.getElementById("createNewButton").style.display = "block";
      }
    if (i == (listFiles.length - 1)) {
      document.getElementById("loading").style.display = "none";
      
      document.getElementById("demo").style.display = "block";
      document.getElementById("demo").innerHTML = data[0];
        // document.getElementById("view").style.display = "block";
      document.getElementById("demo").style.color = "green";
      document.getElementById("demo").innerHTML = "FINISH CREATE CDS PACKAGE !!!";
      document.getElementById("createNewButton").style.display = "block";
    }
    
  } 

  
}

