const Swal = require('sweetalert2');
const path = require('path');
// const fs = require('fs');
const { ipcRenderer } = require('electron');



const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: false,
});

const getFiles = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        reject(error);
      }
      resolve(files);
    });
  });
};

async function selectFolder(type) {
  try {
    const [data] = await ipcRenderer.invoke('show-open-dialog');
    const files = await getFiles(data);

    if (files.length > 0) {
      const folderPath = data + '\\';
      if (type === 'Docs') {
        document.getElementById('filePath').value = folderPath;
      } else if (type === 'Excel') {
        document.getElementById('filePath2').value = folderPath;
      }
    } else {
      Swal.fire('Error', 'The folder is empty', 'error');
    }
  } catch (error) {
    console.log('Error selecting folder:', error);
  }
}

function getFolderPath(filePath) {
  if (fs.lstatSync(filePath).isDirectory()) {
    // Case testing if the folder is empty
    return filePath;
  } else {
    var folder = filePath.split('\\');
    let splicedStr = folder.slice(0, folder.length - 1).join('\\') + '\\';
    return splicedStr;
  }
}

function handleSend() {
  var folderInput = document.getElementById('filePath').value;
  var excelInput = document.getElementById('filePath2').value;

  // Check if folderInput is empty
  if (!folderInput || !excelInput) {
    Swal.fire('Error', 'Folder input is not specified!', 'error');
    return; // Stop the function execution
  }

  var options = {
    scriptPath: './',
    args: [folderInput, excelInput],
  };

  data = window.function_3.exec('main.py', 'send_email', folderInput, excelInput);
  console.log(data);

  data.then(function (result) {
    // Assuming "result" is an Array with the message content
    if (result[0] === 'Success') {
      Swal.fire('Success', 'Success', 'success');
    } else if (result[0] === 'Fail'){
      Swal.fire('Warning', 'Cannot send any CDSs and Shipping Docs, please recheck all files', 'warning');
    }else {
      Swal.fire('Warning', 'Already sent all CDS and Shipping Docs but ' + result[0], 'warning');
    }
  }).catch(function (error) {
    // Handle any errors that occurred during the promise execution
    console.error('Error:', error);
    Swal.fire('Error', 'An error occurred', 'error');
  });
}

function saveEmailList(values) {
  const results = values.map((item) => [item.index, item.email]);
  window.function_3.exec('main.py','save_email', JSON.stringify(results));

  Toast.fire({
    icon: 'success',
    title: 'Email list updated successfully',
  });
}

function getLocalEmails() {
  const $rows = document
    .getElementById('tblcsvdata')
    .getElementsByTagName('tr');

  const data = [];

  for (let row = 1; row < $rows.length; row++) {
    const cells = $rows[row].getElementsByTagName('td');
    data.push({
      index: cells[0].innerHTML.trim(),
      email: cells[1].innerHTML.trim(),
    });
  }

  return data;
}

async function getRemoteEmails() {
  return new Promise((resolve, reject) => {
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

    const filePath = filePythonPath+"backend/function_3/data.csv";
    console.log(filePath)
    fs.readFile(filePath, 'utf8', function (error, csvdata) {
      if (error) {
        reject(error);
      }
      const rows = csvdata.split('\n');
      const results = rows
        .filter((row, index) => index > 0)
        .map((row) => ({ index: row.split(',')[0], email: row.split(',')[1] }));
      resolve(results);
    });
  });
}

const renderEmailList = (data) => {
  const $body = document
    .getElementById('tblcsvdata')
    .getElementsByTagName('tbody')[0];
  $body.innerHTML = '';
  for (const item of data) {
    const { index, email } = item;
    const $row = `<tr><td>${index}</td><td>${email}</td><td><button data-email="${email}" class="deleteButton">Delete</button></td></tr>`;
    $body.innerHTML += $row;
  }
};

const deleteEmailClick = () => {
  document
    .getElementById('tblcsvdata')
    .addEventListener('click', function (event) {
      if (event.target.className === 'deleteButton') {
        Swal.fire({
          title: 'Are you sure delete this email?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#0276ff',
          confirmButtonText: 'Yes, delete it',
        }).then((result) => {
          if (result.isConfirmed) {
            const email = event.target.getAttribute('data-email');
            const oldEmails = getLocalEmails();
            const data = oldEmails
              .filter((item) => item.email !== email)
              .map((item, index) => ({ index: index + 1, email: item.email }));
            renderEmailList(data);
            saveEmailList(data);
          }
        });
      }
    });
};

const addEmailClick = () => {
  document.getElementById('add-email-btn').addEventListener('click', () => {
    Swal.fire({
      title: 'Enter new email',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: 'Enter new email',
      },
      showCancelButton: true,
      confirmButtonText: 'Save',
      showLoaderOnConfirm: true,
      confirmButtonColor: '#0276ff',
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(({ isConfirmed, value }) => {
      if (isConfirmed) {
        const oldEmails = getLocalEmails();
        const isExisted = oldEmails.some((v) => v.email === value);
        if (isExisted) {
          Toast.fire({
            icon: 'error',
            title: 'This email is exsited in list',
          });
        } else {
          const data = [
            ...oldEmails,
            { index: oldEmails.length + 1, email: value },
          ];
          renderEmailList(data);
          saveEmailList(data);
        }
      }
    });
  });
};

async function main() {
  try {
    addEmailClick();
    deleteEmailClick();
    const emails = await getRemoteEmails();
    renderEmailList(emails);
  } catch (error) {
    console.log(error);
  }
}

main();
