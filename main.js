const mcu = new (require('rp2040js').RP2040);
const hex = require('fs').readFileSync('hello_serial.hex', 'utf-8');
const usb = require("./node_modules/rp2040js/dist/cjs/usb/cdc");
const logging = require('./node_modules/rp2040js/dist/cjs/utils/logging')

const FLASH_START_ADDRESS = 0x10000000;

mcu.loadBootrom(require('./bootrom'));
mcu.logger = new logging.ConsoleLogger(logging.LogLevel.Error);
// require('./intelhex').loadHex(hex, mcu.flash, FLASH_START_ADDRESS);
require('./load-flash').loadUF2('rp2-pico-20210902-v1.17.uf2', mcu, FLASH_START_ADDRESS);

mcu.uart[0].onByte = (value) => process.stdout.write(new Uint8Array([value]));

const cdc = new usb.USBCDC(mcu.usbCtrl);
cdc.onSerialData = (value) => process.stdout.write(value);
cdc.onDeviceConnected = () => '\r\n'.split('').forEach(c => cdc.sendSerialByte(c.charCodeAt(0)));

process.stdin.setRawMode(true);
process.stdin.on('data', (chunk) => {
  if (chunk[0] === 24)process.exit(0);
  for(const byte of chunk)cdc.sendSerialByte(byte);
});

mcu.PC = FLASH_START_ADDRESS;
mcu.execute();
