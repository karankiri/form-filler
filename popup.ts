// NOTE: despite the filename this is the CONTENT SCRIPT (see CLAUDE.md).
import { collectFields, formFiller, ProfileData } from "./content-script/constants";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.from !== "popup" || msg?.subject !== "fillForm") return;

  chrome.storage.local.get(["formFillerData"]).then((result) => {
    const data = result.formFillerData as ProfileData | undefined;
    if (!data) {
      sendResponse({ ok: false, error: "No profile saved" });
      return;
    }
    const fields = collectFields();
    const outcome = formFiller(fields, data, { overwrite: !!msg.overwrite });
    sendResponse({ ok: true, ...outcome });
  });

  // Keep the message channel open for the async response.
  return true;
});
