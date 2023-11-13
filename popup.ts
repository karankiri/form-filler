import { formFiller } from "./content-script/constants";
chrome.runtime.sendMessage({
  from: 'content',
  subject: 'showPageAction',
});

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // First, validate the message's structure.
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data. 
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`.)

    // Directly respond to the sender (popup), 
    // through the specified callback.
    chrome.storage.local.get(["formFillerData"]).then((result) => {
      if (result.formFillerData) {
        formFiller(document.querySelectorAll('input'), result.formFillerData);
      }
    });
    response();
  }
});
