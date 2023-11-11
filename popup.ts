function popup() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var activeTab = tabs[0];
    activeTab?.id && chrome.tabs.sendMessage(activeTab?.id, { "message": "toggle" });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("showButton")?.addEventListener("click", popup);
});