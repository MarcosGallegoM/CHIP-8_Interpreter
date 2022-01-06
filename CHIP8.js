class CHIP8 {
	constructor() {
		this.PC = 0x200;
		this.V = new Uint8Array(16);
		this.V.fill(0);
		this.I = 0x200;
		this.SP = 0;
		this.Stack = new Uint32Array(16);
		this.Stack.fill(0);
		this.DT = 0;
		this.ST = 0;
		this.Screen = new Array(2048);
		for (let i = 0; i < this.Screen.length; ++i) {
			this.Screen[i] = 0;
		}
		this.Memory = new Uint8Array(4096);
		this.Memory.fill(0);
		this.Display = {};
		this.Display.Element = {};
		this.Display.Element = document.createElement("canvas");
		document.body.appendChild(this.Display.Element);
		this.Display.Element.width = 64;
		this.Display.Element.height = 32;
		this.Display.Context;
		this.Display.Context = this.Display.Element.getContext("2d");
		this.Display.height = 32;
		this.Display.width = 64;		
		this.Keys = new Array(16);
		this.Keys.fill(0);
		this.Fonts = [
			[0xF0, 0x90, 0x90, 0x90, 0xF0], 
			[0x20, 0x60, 0x20, 0x20, 0x70], 
			[0xF0, 0x10, 0xF0, 0x80, 0xF0],
			[0xF0, 0x10, 0xF0, 0x10, 0xF0],
			[0x90, 0x90, 0xF0, 0x10, 0x10],
			[0xF0, 0x80, 0xF0, 0x10, 0xF0],
			[0xF0, 0x80, 0xF0, 0x90, 0xF0],
			[0xF0, 0x10, 0x20, 0x40, 0x40],
			[0xF0, 0x90, 0xF0, 0x90, 0xF0],
			[0xF0, 0x90, 0xF0, 0x10, 0xF0],
			[0xF0, 0x90, 0xF0, 0x90, 0x90],
			[0xE0, 0x90, 0xE0, 0x90, 0xE0],
			[0xF0, 0x80, 0x80, 0x80, 0xF0],
			[0xE0, 0x90, 0x90, 0x90, 0xE0],
			[0xF0, 0x80, 0xF0, 0x80, 0xF0],
			[0xF0, 0x80, 0xF0, 0x80, 0x80]];
		for (let x = 0; x < this.Fonts.length; x++) {
			for (let y = 0; y < this.Fonts[x].length; y++) {
				this.Memory[(x*5)+y] = this.Fonts[x][y];
			}
		}
		this.Interval = 0;
		this.WaitingForKeyPress = false;
		this.InitiateKeyHandling();
		this.KeyPressOut = 0;
		this.IsInInterval = false;
		this.StartTimers();
		this.TimersInterval;
	}
	StartTimers() {
		let self = this;
		this.TimersInterval = setInterval(function() {
			if (self.DT > 0) {
				self.DT--;
			}
			if (self.ST > 0) {
				self.ST--;
			}
		}, 16.66)
	}
	InitiateKeyHandling() {
		let self = this;
		document.onkeydown = function(event) {
			let key = self.GetKeyFromEvent(event.which);
			self.Keys[key] = 1;
			if (self.WaitingForKeyPress) {
				self.V[self.KeyPressOut] = key;
				if (self.IsInInterval) {
					self.Start(self.Interval);
				}
				self.StopWaitingForKeyPress();
			}
		};
		document.onkeyup = function(event) {
			let key = self.GetKeyFromEvent(event.which);
			self.Keys[key] = 0;
		};
	}
	GetKeyFromEvent(value) {
		switch (value) {
			case 49:
				return 0x1;
				break;
			case 50:
				return 0x2;
				break;
			case 51:
				return 0x3;
				break;
			case 52:
				return 0xC;
				break;
			case 81:
				return 0x4;
				break;
			case 87:
				return 0x5;
				break;
			case 69:
				return 0x6;
				break;
			case 82:
				return 0xD;
				break;
			case 65:
				return 0x7;
				break;
			case 83:
				return 0x8;
				break;
			case 68:
				return 0x9;
				break;
			case 70:
				return 0xE;
				break;
			case 90:
				return 0xA;
				break;
			case 88:
				return 0x0;
				break;
			case 67:
				return 0xB;
				break;
			case 86:
				return 0xF;
				break;
		}
	}
	SYS(addr) {
		// console.log("SYS Instruction Isn't Implemented.");
		this.PC++;
	}
	CLS() {
		for (let x = 0; x < this.Screen.length; x++) {
			this.Screen[x] = 0;
		}
		this.PC += 2;
		this.UpdateScreen();
	}
	RET() {
		this.PC = this.Stack[this.SP];
		this.SP--;
		this.PC += 2;
	}
	CALL(addr) {
		this.SP++;
		this.Stack[this.SP] = this.PC;
		this.PC = addr;
	}
	SE(a, b, c) {
		if (c == 0 || !c) {
			// SE Vx, byte
			if (this.V[a] == b) {
				this.PC += 4;
			} else {
				this.PC += 2;
			}
		} else if (c == 1) {
			if (this.V[a] == this.V[b]) {
				this.PC += 4;
			} else {
				this.PC += 2;
			}
		}
	}
	SNE(a, b, c) {
		if (c == 0 || !c) {
			// SE Vx, byte
			if (this.V[a] != b) {
				this.PC += 4;
			} else {
				this.PC += 2;
			}
		} else if (c == 1) {
			if (this.V[a] != this.V[b]) {
				this.PC += 4;
			} else {
				this.PC += 2;
			}
		}
	}
	LD(a, b, c) {
		if (c == 0) {
			this.V[a] = b;
			this.PC += 2;
		} else if (c == 1) {
			this.V[a] = this.V[b];
			this.PC += 2;
		} else if (c == 2) {
			this.I = a;
			this.PC += 2;
		} else if (c == 3) {
			this.V[a] = this.DT;
			this.PC += 2;
		} else if (c == 4) {
			this.WaitForKeyPress(a);
			this.PC += 2;
		} else if (c == 5) {
			this.DT = this.V[a];
			this.PC += 2;
		} else if (c == 6) {
			this.ST = this.V[a];
			this.PC += 2;
		} else if (c == 7) {
			this.I = this.V[a] * 5;
			this.PC += 2;
		} else if (c == 8) {
			let bcd = this.V[a].toString();
			if (bcd.length == 1) {
				bcd = "00"+bcd;
			} else if (bcd.length == 2) {
				bcd = "0"+bcd;
			}
			for (let x = 0; x < bcd.length; x++) {
				this.Memory[this.I+x] = parseInt(bcd[x]);
			}
			this.PC += 2;
		} else if (c == 9) {
			let x = 0;
			for (let y of this.V.slice(0, a+1)) {
				this.Memory[this.I+x] = y;
				x++;
			}
			this.PC += 2;
		} else if (c == 10) {
			for (let x = 0; x <= a; x++) {
				this.V[x] = this.Memory[this.I+x]
			}
			this.PC += 2;
		}
	}
	ADD(a, b, c) {
		if (c == 0 || !c) {
			this.V[a] += b;
			this.PC += 2;
		} else if (c == 1) {
			let res = this.V[a]+this.V[b];
			this.V[0xF] = (res > 255) ? 1 : 0;
			this.V[a] = res & 0xFF;
			this.PC += 2;
		} else if (c == 2) {
			this.I += this.V[a];
			this.PC += 2;
		}
	}
	OR(x, y) {
		this.V[x] |= this.V[y];
		this.PC += 2;
	}
	AND(x, y) {
		this.V[x] &= this.V[y];
		this.PC += 2;
	}
	XOR(x, y) {
		this.V[x] ^= this.V[y];
		this.PC += 2;
	}
	SUB(x, y) {
		this.V[0xF] = (this.V[x] >= this.V[y]) ? 1 : 0;
		this.V[x] = (this.V[x] - this.V[y]) & 0xFF;
		this.PC += 2;
	}
	SHR(x, y) {
		this.V[0xF] = ((this.V[x] & 1) == 1) ? 1 : 0;
		this.V[x] /= 2;
		this.PC += 2;
	}
	SUBN(x, y) {
		this.V[0xF] = (this.V[y] >= this.V[x]) ? 1 : 0;
		this.V[x] = this.V[y] - this.V[x];
		this.PC += 2;
	}
	SHL(x, y) {
		this.V[0xF] = ((this.V[x] & 0x80) == 0x80) ? 1 : 0;
		this.V[x] *= 2;
		this.PC += 2;
	}
	JP(a, b) {
		if (b == 0 || !b) {
			this.PC = a;
		} else if (b == 1) {
			this.PC = a + this.V[0x0];
		}
	}
	RND(x, byte) {
		let n = random.randint(0, 255);
		n &= byte;
		this.V[x] = n;
		this.PC += 2;
	}
	SKP(x) {
		if (this.Keys[this.V[x]] == 1) {
			this.PC += 4;
		} else {
			this.PC += 2;
		}
	}
	SKNP(x) {
		if (this.Keys[this.V[x]] != 1) {
			this.PC += 4;
		} else {
			this.PC += 2;
		}
	}
	DRW(x, y, n) {
		let spriteData = this.Memory.slice(this.I, this.I+n);
		let xPos = this.V[x];
		let yPos = this.V[y];
		let f = this.DrawSprite(spriteData, n, xPos, yPos);
		this.V[0xF] = f ? 1 : 0;
		this.UpdateScreen();
		this.PC += 2;
	}
	DrawSprite(data, dataSep, x, y) {
		let xord = false;
		for (let z = 0; z < data.length; z++) {
			this.Screen[((y+z)*this.Display.width)+x] ^= (data[z] & 0b10000000) >> 7;
			if (this.Screen[((y+z)*this.Display.width)+x] == 0 && (data[z] & 0b10000000) == 0b10000000) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+1] ^= (data[z] & 0b01000000) >> 6;
			if (this.Screen[((y+z)*this.Display.width)+x+1] == 0 && (data[z] & 0b01000000) == 0b01000000) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+2] ^= (data[z] & 0b00100000) >> 5;
			if (this.Screen[((y+z)*this.Display.width)+x+2] == 0 && (data[z] & 0b00100000) == 0b00100000) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+3] ^= (data[z] & 0b00010000) >> 4;
			if (this.Screen[((y+z)*this.Display.width)+x+3] == 0 && (data[z] & 0b00010000) == 0b00010000) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+4] ^= (data[z] & 0b00001000) >> 3;
			if (this.Screen[((y+z)*this.Display.width)+x+4] == 0 && (data[z] & 0b00001000) == 0b00001000) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+5] ^= (data[z] & 0b00000100) >> 2;
			if (this.Screen[((y+z)*this.Display.width)+x+5] == 0 && (data[z] & 0b00000100) == 0b00000100) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+6] ^= (data[z] & 0b00000010) >> 1;
			if (this.Screen[((y+z)*this.Display.width)+x+6] == 0 && (data[z] & 0b00000010) == 0b00000010) {
				xord = true;
			}
			this.Screen[((y+z)*this.Display.width)+x+7] ^= (data[z] & 0b00000001);
			if (this.Screen[((y+z)*this.Display.width)+x+7] == 0 && (data[z] & 0b00000001) == 0b00000001) {
				xord = true;
			}
		}
		return xord;
	}
	UpdateScreen() {
		for (let y = 0; y < this.Display.height; y++) {
			for (let x = 0; x < this.Display.width; x++) {
				this.Display.Context.beginPath();
				this.Display.Context.fillStyle = (this.Screen[(y*this.Display.width)+x] == 1) ? "white" : "black";
				this.Display.Context.fillRect(x, y, 1, 1);
				this.Display.Context.fill();
			}
		}
	}
	Step() {
		let opCode = (this.Memory[this.PC] << 8) + this.Memory[this.PC+1];
		let str = "";
		str += "PC: "+this.PC.toString(16)+"; I: "+this.I.toString(16)+"; HEX: "+opCode.toString(16);
		for (let x = 0; x < 16; x++) {
			str += "\nV"+x.toString(16).toUpperCase()+": "+this.V[x].toString(16);
		}
		// console.log(str);
		if (this.WaitingForKeyPress) {
			// console.log("Waiting For Keypress.");
			return;
		}
		switch (opCode & 0xF000) {
			case 0x0000:
				switch (opCode) {
					case 0x00E0:
						this.CLS();
						break;
					case 0x00EE:
						this.RET();
						break;
					default:
						this.SYS(opCode & 0x0FFF);
						break;
				}
				break;
			case 0x1000:
				this.JP(opCode & 0x0FFF, 0);
				break;
			case 0x2000:
				this.CALL(opCode & 0x0FFF);
				break;
			case 0x3000:
				this.SE((opCode & 0x0F00) >> 8, opCode & 0x00FF, 0);
				break;
			case 0x4000:
				this.SNE((opCode & 0x0F00) >> 8, opCode & 0x00FF, 0);
				break;
			case 0x5000:
				this.SE((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4, 1);
				break;
			case 0x6000:
				this.LD((opCode & 0x0F00) >> 8, opCode & 0x00FF, 0);
				break;
			case 0x7000:
				this.ADD((opCode & 0x0F00) >> 8, opCode & 0x00FF, 0);
				break;
			case 0x8000:
				switch (opCode & 0x000F) {
					case 0x0000:
						this.LD((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4, 1);
						break;
					case 0x0001:
						this.OR((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x0002:
						this.AND((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x0003:
						this.XOR((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x0004:
						this.ADD((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4, 1);
						break;
					case 0x0005:
						this.SUB((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x0006:
						this.SHR((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x0007:
						this.SUBN((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					case 0x000E:
						this.SHL((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4);
						break;
					default:
						// console.error("Error: The following Instruction wasn't identified: "+opCode.toString(16));
						break;
				}
				break;
			case 0x9000:
				this.SNE((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4, 1);
				break;
			case 0xA000:
				this.LD(opCode & 0x0FFF, 0, 2);
				break;
			case 0xB000:
				this.JP(opCode & 0x0FFF, 1);
				break;
			case 0xC000:
				this.RND((opCode & 0x0F00) >> 8, opCode & 0x00FF);
				break;
			case 0xD000:
				this.DRW((opCode & 0x0F00) >> 8, (opCode & 0x00F0) >> 4, opCode & 0x000F);
				break;
			case 0xE000:
				switch (opCode & 0x00FF) {
					case 0x009E:
						this.SKP((opCode & 0x0F00) >> 8);
						break;
					case 0x00A1:
						this.SKNP((opCode & 0x0F00) >> 8);
						break;
					default:
						// console.error("Error: The following Instruction wasn't identified: "+opCode.toString(16));
						this.PC += 2;
						break;
				}
				break;
			case 0xF000:
				switch (opCode & 0x00FF) {
					case 0x0007:
						this.LD((opCode & 0x0F00) >> 8, 0, 3);
						break;
					case 0x000A:
						this.LD((opCode & 0x0F00) >> 8, 0, 4);
						break;
					case 0x0015:
						this.LD((opCode & 0x0F00) >> 8, 0, 5);
						break;
					case 0x0018:
						this.LD((opCode & 0x0F00) >> 8, 0, 6);
						break;
					case 0x001E:
						this.ADD((opCode & 0x0F00) >> 8, 0, 2);
						break;
					case 0x0029:
						this.LD((opCode & 0x0F00) >> 8, 0, 7);
						break;
					case 0x0033:
						this.LD((opCode & 0x0F00) >> 8, 0, 8);
						break;
					case 0x0055:
						this.LD((opCode & 0x0F00) >> 8, 0, 9);
						break;
					case 0x0065:
						this.LD((opCode & 0x0F00) >> 8, 0, 10);
						break;
					case 0x0075:
						// console.log("HP48/Super Chip-48 instructions not implemented.");
						this.PC += 2;
						break;
					case 0x0085:
						// console.log("HP48/Super Chip-48 instructions not implemented.");
						this.PC += 2;
						break;
					default:
						// console.error("Error: The following Instruction wasn't identified: "+opCode.toString(16));
						break;
				}
				break;
		}
	}
	LoadProgram(data) {
		for (let x = 0; x < data.length; x++) {
			this.Memory[0x200 + x] = data[x];
		}
		// console.log("Program Loaded.");
	}
	Start(intervalTime) {
		let self = this;
		this.IsInInterval = true;
		this.Interval = setInterval(function() {
			self.Step();
		}, intervalTime);
	}
	Stop() {
		this.IsInInterval = false;
		clearInterval(this.Interval);
	}
	WaitForKeyPress(register) {
		if (this.IsInInterval) {
			this.Stop();
			this.IsInInterval = true;
		}
		this.KeyPressOut = register;
		this.WaitingForKeyPress = true;
	}
	StopWaitingForKeyPress() {
		this.WaitingForKeyPress = false;
	}
	DestroySelf() {
		this.Stop();
		document.body.removeChild(this.Display.Element);
	}
}