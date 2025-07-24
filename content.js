//IIFE function is used to dynamically inject the blocking overlay
// This script runs on every page load to check if the current site is blocked

(async () => {
  const [{ blocked }, { blockConfig }] = await Promise.all([
    chrome.storage.sync.get("blocked"),
    chrome.storage.sync.get("blockConfig"),
  ]);

  const domain = location.hostname.replace(/^www\./, "");
  const now = Date.now();

  const matchedEntry = (blocked || []).find((entry) => {
    if (!domain.includes(entry.site)) return false;

    if (entry.mode === "permanent") return true;

    if (entry.mode === "timer") {
      const remainingMs = entry.durationMs - (now - entry.addedAt);
      return remainingMs > 0;
    }

    return false;
  });

  if (!matchedEntry) return;

  // Inject overlay
  const config = blockConfig || {};
  const message = config.message || "Blocked!";
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "#121212";
  overlay.style.color = "#fff";
  overlay.style.fontFamily = "monospace";
  overlay.style.fontSize = "5vw";
  overlay.style.fontWeight = "bold";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999999";
  overlay.style.textAlign = "center";
  overlay.style.flexDirection = "column";
  overlay.style.userSelect = "none";

  const msg = document.createElement("div");
  msg.textContent = message;

  const timer = document.createElement("div");
  timer.style.fontSize = "3vw";
  timer.style.marginTop = "10px";

  overlay.appendChild(msg);
  overlay.appendChild(timer);
  document.body.appendChild(overlay);

  // Handle countdown
  if (matchedEntry.mode === "timer") {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = matchedEntry.durationMs - (now - matchedEntry.addedAt);

      if (remaining <= 0) {
        clearInterval(interval);

        // ✅ Remove overlay
        overlay.remove();

        // ✅ Delete from blocked list
        chrome.storage.sync.get(["blocked"], (data) => {
          const sites = data.blocked || [];
          const updated = sites.filter((e) => e.site !== matchedEntry.site);
          chrome.storage.sync.set({ blocked: updated });
        });
        
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        timer.textContent = `Unblocking in ${mins}m ${secs}s`;
      }
    }, 500);
  }
})();
