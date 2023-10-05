const fs = require('fs');
const { sha512 } = require('js-sha512');
const ipc = require('electron').ipcRenderer

function validate() {
  
  const userName = document.getElementById('userName').value;
  const passWord = document.getElementById('pass').value;
  console.log(userName);
  console.log(sha512((passWord)))
  if((sha512((passWord)) === config["app"][0]["password"])&(userName === config["app"][0]["admin"])) {
    document.querySelector("main").style.display = "block";
    document.getElementById("lockApp").style.display = "none";
    config["app"][0]["permission"] = "yes"
    fs.writeFile("./app.json", JSON.stringify(config), function(err) {
      if (err) throw err;
      });
  }
  else {
    document.querySelector("main").style.display = "none";
    document.getElementById("lockApp").style.display = "block";
  }
  
}

// close app
function closeApp(e) {
  e.preventDefault()
  console.log('REACH')
  ipc.send('close')
}

// const sample = require('../app.json');
// console.log(sample);

const data = fs.readFileSync('./app.json');
var config = JSON.parse(data);
// console.log(config["app"][0]["version"])

document.getElementById("appVersion").innerHTML=config["app"][0]["version"];
document.querySelector("title").textContent = config["app"][0]["name"] + " (Latest updated: " + config["app"][0]["latestUpdated"]+")";

if(config["app"][0]["permission"] === "yes") {
  document.querySelector("main").style.display = "block";
  document.getElementById("lockApp").style.display = "none";
} else {
  document.querySelector("main").style.display = "none";
  document.getElementById("lockApp").style.display = "block";
}

document.getElementById("closeApp").addEventListener("click", closeApp);