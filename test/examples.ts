/* eslint-disable no-console */

import { assert } from 'chai';
import { EndOfStreamError, StreamReader } from '../lib/index.js';
import * as fs from "fs";

describe('Examples', () => {

  it('first example', async () => {

    const readable = fs.createReadStream(new URL('resources/JPEG_example_JPG_RIP_001.jpg', import.meta.url));
    const streamReader = new StreamReader(readable);
    const uint8Array = new Uint8Array(16);
    const bytesRead = await streamReader.read(uint8Array, 0, 16);
    assert.equal(bytesRead, 16);
  });

  it('End-of-stream detection', async () => {

    const fileReadStream = fs.createReadStream(new URL('resources/JPEG_example_JPG_RIP_001.jpg', import.meta.url));
    const streamReader = new StreamReader(fileReadStream);
    const uint8Array =  new Uint8Array(16);
    assert.equal(await streamReader.read(uint8Array, 0, 16), 16);
    try {
      while(await streamReader.read(uint8Array, 0, 1) > 0);
      assert.fail('Should throw EndOfStreamError');
    } catch(error) {
      assert.isOk(error instanceof EndOfStreamError, 'Expect `error` to be instance of `EndOfStreamError`');
      if (error instanceof EndOfStreamError) {
        console.log('End-of-stream reached');
      }
    }
  });

  it('peek', async () => {

    const fileReadStream = fs.createReadStream(new URL('resources/JPEG_example_JPG_RIP_001.jpg', import.meta.url));
    const streamReader = new StreamReader(fileReadStream);
    const buffer = Buffer.alloc(20);

    let bytesRead = await streamReader.peek(buffer, 0, 3);
    if (bytesRead === 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      console.log('This is a JPEG file');
    } else {
      throw Error('Expected a JPEG file');
    }
    bytesRead = await streamReader.read(buffer, 0, 20); // Read JPEG header
    if (bytesRead === 20) {
      console.log('Got the JPEG header');
    } else {
      throw Error('Failed to read JPEG header');
    }
  });

});
