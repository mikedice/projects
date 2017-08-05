var i2c = require('i2c');
var sleep = require('sleep');
var address = 0x20;
var AddressOfBankA =0x14;

var wire = new i2c(address, {device: '/dev/i2c-1'});

// 8 bits are written to MCP23017 GPIO Bank A to control the lights. 
// To turn on the row 1 column 1 (1,1) light make GPA0 high and GPA4 low. 
// This will complete circuit through top-left light. 

// On the MCP23017 the right-most bit represents GPIO Bank A pin 0 (GPA0)
// and the left-most bit represents GPIO Bank A pin 7 (GPA7). 
// Handily, the bits in the digital word used to control the GPIO pins on the 
// MCP23017 are arranged in the same order as the physical pins on the chip :)
// With that in mind if we want to turn on row one column 1 (1,1)  we write
// the following digital word to the MCP23017 Bank A
//   1110 0001 (hex 0xE1)
// This will cause pin GPA0 to be set to HIGH (+3.3V on a Raspbery Pi) 
// and pin GPA4 to LOW (aka ground) the circuit through the light at (1,1)
// will be completed and the light will shine bright like a diamond

// If we want to turn on row 1 column 2 (1, 2) we write
//    1110 0010 (hex 0xE2)
// And for (1, 3)
//    1110 0100 (hex 0xE4)
// And for (1, 4)
//    1110 1000 (hex 0xE8)
// And for (2, 1)
//    1101 0001 (hex 0xD1)
// The table below shows the digital words you can use for
// each light in the grid
var data = [
0xE1,0xE2,0xE4,0xE8, // row 1
0xD1,0xD2,0xD4,0xD8, // row 2
0xB1,0xB2,0xB4,0xB8, // row 3
0x71,0x72,0x74,0x78  // row 4
];


// turn on lights to spell HAILEY
var H = [0xE1,          0xE8,
         0xD1,0xD2,0xD4,0xD8,
         0xB1,          0xB8,
         0x71,          0x78];

var A = [0xE1,0xE2,0xE4,0xE8,
         0xD1,          0xD8,
         0xB1,0xB2,0xB4,0xB8,
         0x71,          0x78];

var I = [0xE1,0xE2,0xE4,    
              0xD2,
              0xB2,
         0x71,0x72,0x74];

var L = [0xE1,
         0xD1,
         0xB1,
         0x71,0x72,0x73];

var E = [0xE1,0xE2,0xE4,
         0xD1,
         0xB1,0xB2,
         0x71,0x72,0x74];

var Y = [0xE1,         0xE8,
              0xD2,0xD4,
              0xB2,
              0x72];

var blank = [0xE0, 0xD0, 0xB0, 0x70];

console.log('wire created');


function displayChar(chr, idx, duration, callback){
    // go through the pixels in each 'character' array and turn them on/off rapidly
    wire.writeBytes(AddressOfBankA, // addressing bank A of the mcp20317 io pins
            [chr[idx]], // the character to write
            function(){ // callback after the write operation completes
                sleep.usleep(750);
                if (duration>0){
                    duration--;
                    if (idx < chr.length){
                        displayChar(chr, idx+1, duration, callback);
                    }
                    else
                    {
                        idx = 0;
                        displayChar(chr, idx, duration, callback);
                    }
                }
                else{
                    callback();
                }
    });
}


function displayMessage(){
    var duration=250;
    displayChar(H, 0, duration, function(){
        displayChar(blank, 0, 1, function(){
            displayChar(A, 0, duration, function(){
                displayChar(blank, 0, 1, function(){
                    displayChar(I, 0, duration, function(){
                        displayChar(blank, 0, 1, function(){
                            displayChar(L, 0, duration, function(){
                                displayChar(blank, 0, 1, function(){
                                    displayChar(E, 0, duration, function(){
                                        displayChar(blank, 0, 1, function(){
                                            displayChar(Y, 0, duration, function(){
                                                displayChar(blank, 0, 1, function(){
                                                    displayMessage();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });    
    });
};
wire.writeBytes(0x00, [0x00], function(){
    displayMessage();
});

