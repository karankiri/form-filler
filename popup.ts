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
    const allInputs: any[] = []
    // document.querySelectorAll('iframe').forEach(item => {
    //   console.log("🚀 ~ file: popup.ts:18 ~ document.querySelectorAll ~ item:", item)
    //   const items = item.contentWindow?.document.body.querySelectorAll('input')
    //   if (items && items.length) {
    //     allInputs.push(items)
    //   }
    // })
    allInputs.push(document.querySelectorAll('input'))
    chrome.storage.local.get(["formFillerData"]).then((result) => {
      if (result.formFillerData) {
        formFiller(allInputs, result.formFillerData);
      }
    });
    response();
  }
});
