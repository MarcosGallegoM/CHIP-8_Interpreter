random = {
	randint: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
};

let File;
let FileName;
let interval;
let fileInput = document.getElementById("fileIn");
// let intervalInput = document.getElementById("IntervalTimeIn");
let loadBtn = document.getElementById("LoadFile");
let startBtn = document.getElementById("StartInterval");
let stopBtn = document.getElementById("StopInterval");
let resetBtn = document.getElementById("Reset");
fileInput.onchange = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
		let file = this.result;
		let n = fileInput.files[0].name;
		FileName = n;
		File = new Uint8Array(file);
    }
    reader.readAsArrayBuffer(this.files[0]);
};

loadBtn.onclick = function() {
	C8.LoadProgram(File);
};
startBtn.onclick = function() {
	C8.Start(0);
};
stopBtn.onclick = function() {
	C8.Stop();
};
resetBtn.onclick = function() {
	C8.DestroySelf();
	C8 = new CHIP8();
}

// Start Here.

let C8 = new CHIP8();