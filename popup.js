function popup() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var activeTab = tabs[0];
    console.log("🚀 ~ file: popup.js:4 ~ activeTab:", activeTab)
    chrome.tabs.sendMessage(activeTab.id, { "message": "start" });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("showButton").addEventListener("click", popup);
});