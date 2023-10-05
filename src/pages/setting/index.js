var fs = require('fs');
const Swal = require('sweetalert2');

let userName = document.querySelector('input[name="username"]');
let passWord = document.querySelector('input[name="password"]');
let taxCode = document.querySelector('input[name="tax_code"]');

const data = fs.readFileSync('./app.json');
var config = JSON.parse(data);
// console.log(config["app"][0]["version"])

document.getElementById("appVersion").innerHTML=config["app"][0]["version"];
document.querySelector("title").textContent = config["app"][0]["name"];
document.querySelector("title").textContent = config["app"][0]["name"] + " (Latest updated: " + config["app"][0]["latestUpdated"]+")";

if(config["app"][0]["permission"] === "yes") {
    document.querySelector("main").style.display = "block";
    document.getElementById("lockApp").style.display = "none";
  } else {
    document.querySelector("main").style.display = "none";
    document.getElementById("lockApp").style.display = "block";
  }
  
if (fs.existsSync('./data.json')) {
    fs.readFile('./data.json', (err, data) => {
        if (!err && data) {
            console.log(data)
            var mydata = JSON.parse(data);
            userName.value = mydata.username;
            passWord.value = mydata.password;
            taxCode.value = mydata.taxcode;
        }
    })
}

async function submit() {
    // Check if all the required field are provided
    const conditions = await Promise.all([checkExists("username"), checkExists("pass"), checkExists("tax_code")]);
    const allConditions = conditions.every(condition => condition);
    if(allConditions){
        const userName = document.getElementById('username').value;
        const passWord = document.getElementById('pass').value;
        const taxCode = document.getElementById('tax_code').value;
        var data =  {
            "username": userName,
            "password": passWord,
            "taxcode": taxCode
        }
        fs.writeFile("./data.json", JSON.stringify(data), function(err) {
            if (err) throw err;
            }
        );
        Swal.fire({
            icon: 'success',
            title: 'Complete',
            text: "Your work has been saved",
            confirmButtonColor: "#3085d6"
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "The required field is empty, please provide.",
            confirmButtonColor: "#3085d6"
        })
    }

}

function checkExists(value){
    var myInput = document.getElementById(value);
    if (myInput && myInput.value) {
       return true
    }
    return false
}
