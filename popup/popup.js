const input = document.getElementById("siteInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const modeSelect = document.getElementById("modeSelect");
const blockButton = document.getElementById("blockButton");
const siteList = document.getElementById("siteList");

const toggleBtn = document.createElement("button");
toggleBtn.textContent = "Show Site Names";
toggleBtn.style.marginBottom = "10px";
let showNames = false;

toggleBtn.onclick = () => {
  if (!showNames) {
    if (confirm("Are you sure you want to reveal the blocked site names?")) {
      showNames = true;
      toggleBtn.textContent = "Hide Site Names";
      loadBlockedSites();
    }
  } else {
    showNames = false;
    toggleBtn.textContent = "Show Site Names";
    loadBlockedSites();
  }
};

// Insert the toggle button above the site list
siteList.parentNode.insertBefore(toggleBtn, siteList);

function loadBlockedSites() {
  chrome.storage.sync.get(["blocked"], (data) => {
    const blocked = data.blocked || [];
    siteList.innerHTML = "";

    blocked.forEach((entry, index) => {
      const li = document.createElement("li");
      const mode = entry.mode;

      // Show or mask the domain
      const displayDomain = showNames ? entry.site : "•••••";
      let info = `${displayDomain} — ${mode}`;
      if (mode === "timer") {
        const now = Date.now();
        const remaining = entry.durationMs - (now - entry.addedAt);
        if (remaining > 0) {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          info += ` (${mins}m ${secs}s left)`;
        } else {
          info += ` (expired)`;
        }
      }

      li.textContent = info;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.style.marginLeft = "10px";
      removeBtn.onclick = () => {
        if (confirm("Are you sure you want to remove this site from the block list?")) {
          blocked.splice(index, 1);
          chrome.storage.sync.set({ blocked }, () => {
            loadBlockedSites();

            // ✅ Reload after removal
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.reload(tabs[0].id);
              }
            });
          });
        }
      };

      li.appendChild(removeBtn);
      siteList.appendChild(li);
    });
  });
}

function addSite() {
  const rawSite = input.value.trim();
  const site = rawSite
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
  const mode = modeSelect.value;
  const mins = parseInt(minutesInput.value) || 0;
  const secs = parseInt(secondsInput.value) || 0;

  if (!site || site.length < 3) {
    alert("Please enter a valid domain name.");
    return;
  }

  if (
    mode === "timer" &&
    (mins < 0 || secs < 0 || (mins === 0 && secs === 0))
  ) {
    alert("Timer must be greater than 0 seconds.");
    return;
  }

  const newEntry = {
    site,
    mode,
    durationMs: mode === "timer" ? (mins * 60 + secs) * 1000 : null,
    addedAt: Date.now(),
  };

  chrome.storage.sync.get(["blocked"], (data) => {
    const existing = data.blocked || [];

    // Optional: Prevent duplicates
    const alreadyExists = existing.some(
      (e) => e.site === site && e.mode === mode
    );
    if (alreadyExists) {
      alert("This site is already blocked.");
      return;
    }

    existing.push(newEntry);
    chrome.storage.sync.set({ blocked: existing }, () => {
      loadBlockedSites();

      // ✅ Inject content.js immediately (for both modes)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
        }
      });
    });

    input.value = "";
    minutesInput.value = "";
    secondsInput.value = "";
  });
}

blockButton.addEventListener("click", addSite);
loadBlockedSites();
