const fs = require('fs');
const uf2 = require('uf2');

const MICROPYTHON_FS_BLOCKSIZE = 4096;
const MICROPYTHON_FS_BLOCKCOUNT = 352;
const MICROPYTHON_FS_FLASH_START = 0xa0000;

function loadMicropythonFlashImage(filename, rp2040) {
  const file = fs.openSync(filename, 'r');
  const buffer = new Uint8Array(MICROPYTHON_FS_BLOCKSIZE);
  let flashAddress = MICROPYTHON_FS_FLASH_START;
  while (fs.readSync(file, buffer) === buffer.length) {
    rp2040.flash.set(buffer, flashAddress);
    flashAddress += buffer.length;
  }
  fs.closeSync(file);
}

function loadUF2(filename, rp2040, baseAddress) {
  const file = fs.openSync(filename, 'r');
  const buffer = new Uint8Array(512);
  while (fs.readSync(file, buffer) === buffer.length) {
    const block = uf2.decodeBlock(buffer);
    const { flashAddress, payload } = block;
    rp2040.flash.set(payload, flashAddress - baseAddress);
  }
  fs.closeSync(file);
}

module.exports = {
  loadUF2,
  loadMicropythonFlashImage,
};
