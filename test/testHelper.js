import { JSDOM } from 'jsdom';

global.document = new JSDOM('<html><head><script></script></head><body></body></html>');
global.window = global.document.window;
global.navigator = global.document.window.navigator;
global.Node = global.document.window.Node;

function createDocument() {
  const document = global.document;
  const window = global.document.window;
  Object.keys(global.window).forEach((key) => {
    if (!(key in global)) {
      global[key] = global.document.window[key];
    }
  });
  return global.document;
}


exports.document = global.document;
exports.window  = global.window ;
exports.navigator  = global.navigator ;
exports.Node  = global.Node;

const window = global.window;
const document = global.document;

export {window as window, document as document, createDocument as createDocument};

exports.document = global.document;
exports.window  = global.window ;
exports.navigator  = global.navigator ;
exports.Node  = global.Node;

