async function start() {
  // Ví dụ để lấy kết quả từ python 
  const data = await window.function_2.exec('example.py');
  console.log(data);
}

async function submit() {
  // const input = document.getElementById('inputExample').value;

  var fileInput = document.getElementById('fileInput');
  var filePath = fileInput.files[0].path;

  console.log(filePath)

  // Ví dụ để truyền tham số qua python 
  // Thêm bao nhiêu tham số đều được - không giới hạn
  const data = await window.function_2.exec('settingFunction2.py', filePath)
  console.log(data);

  document.getElementById("demo").style.display = "block";
  document.getElementById("demo").innerHTML = data[0];

}