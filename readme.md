

#  Site Blocker Chrome Extension

A dynamic Chrome extension that blocks distracting websites like Facebook, YouTube, Netflix, or any site of your choice — permanently or for a limited time (in minutes/seconds). No page reload needed. Includes an interactive UI to manage blocked sites.

---

## Features

-  Block any website permanently or temporarily
-  Set block duration in minutes and seconds
-  Remove sites from the block list anytime
-  Sites blocked even after browser restart
-  Countdown timers shown in the UI
---

##  Setup Instructions

1. **Clone or download** the extension folder:
   ```bash
   git clone https://github.com/JeraldPascual/site-blocker-extension.git


2. **Open Chrome** and go to:

   ```bash
   chrome://extensions/

3. **Enable Developer Mode** (top-right)

4. Click **"Load unpacked"** and select the project folder.

##  How to Use

1. Click the extension icon.
2. Type the domain (e.g. `facebook.com`).
3. Choose **Permanent** or **Timer**.
4. Enter minutes/seconds if using a timer.
5. Click **"Block Site"**.

The site will instantly show a full-page overlay when visited — no page reload needed.

Absolutely! Here's the **revised "How It Works"** section to reflect that the overlay styles are now dynamically injected via `content.js`, and not dependent on an external `style.css` file:

---

## How It Works

### `popup.js`

* Handles all logic for adding, validating, and saving blocked sites using `chrome.storage.sync`.
* Supports both **permanent** and **timer-based** blocking.
* Injects `content.js` into the active tab immediately after blocking — no reload needed.
* Prevents duplicate entries and invalid inputs (e.g. negative or empty time).

### `content.js`

* Runs in the context of any visited page.
* Retrieves the list of blocked sites and determines if the current domain is blocked.
* For blocked sites:

  * Dynamically injects a fullscreen overlay **with styles and content directly via JavaScript** (no external CSS required).

* For timer-based blocks:

  * Automatically removes the block when the timer expires and updates the stored list.
  * Restores the original page content cleanly without reload or redirection.
