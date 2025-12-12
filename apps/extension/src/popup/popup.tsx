import React from "react";
import ReactDOM from "react-dom/client";

function Popup() {
  const [status, setStatus] = React.useState("로딩 중...");

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { type: "PING" }, (resp) => {
        if (chrome.runtime.lastError) {
          setStatus("이 페이지에서는 PriceBuddy가 동작하지 않습니다.");
        } else if (resp?.ok) {
          setStatus("이 페이지에서 PriceBuddy가 가격을 모니터링 중입니다.");
        }
      });
    });
  }, []);

  return (
    <div className="p-4 w-72 text-sm text-slate-100 bg-slate-950">
      <h1 className="text-base font-semibold mb-2">PriceBuddy</h1>
      <p>{status}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Popup />
);

