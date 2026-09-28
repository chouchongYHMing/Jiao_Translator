chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "translate") return;

  fetch("http://127.0.0.1:8000/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: message.text })
  })
    .then((res) => res.json())
    .then((data) => {
      sendResponse({
        ok: true,
        translation: data.translation || ""
      });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: String(error)
      });
    });

  return true;
});