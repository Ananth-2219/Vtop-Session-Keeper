
(() => {
  if (window.__vtopSessionKeeperLoaded) return;
  window.__vtopSessionKeeperLoaded = true;

  const HOME_URL = "https://vtop.vit.ac.in/vtop/content";
  const CURRICULUM_URL =
    "https://vtop.vit.ac.in/vtop/academics/common/Curriculum";

  let requestInProgress = false;

  // Report genuine interaction with the VTOP page.
  const activityEvents = [
    "click",
    "keydown",
    "scroll",
    "input",
    "change",
    "pointerdown",
    "touchstart"
  ];

  function reportActivity() {
    browser.runtime.sendMessage({
      type: "VTOP_ACTIVITY"
    }).catch(() => {});
  }

  activityEvents.forEach(eventName => {
    document.addEventListener(eventName, reportActivity, {
      capture: true,
      passive: true
    });
  });

  // Initialize inactivity tracking when this page loads.
  reportActivity();

  async function sendCurriculumRequest() {
    if (requestInProgress) return;

    requestInProgress = true;

    try {
      // Obtain current CSRF value from the page.
      const csrf =
        document.querySelector('input[name="_csrf"]')?.value ||
        document.querySelector('meta[name="_csrf"]')?.content ||
        "";

      // Obtain the current authorization value.
      const authorizedID =
        document.querySelector('input[name="authorizedID"]')?.value || "";

      // Do not send a request if the page requires a CSRF token
      // but one cannot be found.
      if (!csrf) {
        console.warn(
          "VTOP Session Keeper: CSRF token not found. Request cancelled."
        );
        return;
      }

      const body = new URLSearchParams({
        verifyMenu: "true",
        authorizedID: authorizedID,
        _csrf: csrf,
        nocache: Date.now().toString()
      });

      const response = await fetch(CURRICULUM_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: body.toString(),
        cache: "no-store"
      });

      if (!response.ok) {
        console.warn(
          "VTOP Session Keeper: Curriculum request failed:",
          response.status
        );
        return;
      }

      const responseText = await response.text();

      // Do not navigate if the server returned a login page.
      if (
        /login|sign in/i.test(responseText.slice(0, 1000)) &&
        /password/i.test(responseText.slice(0, 3000))
      ) {
        console.warn(
          "VTOP Session Keeper: Possible expired session."
        );
        return;
      }

      console.log(
        "VTOP Session Keeper: Curriculum request succeeded."
      );

      // Navigate to Home only after a successful request.
      window.location.assign(HOME_URL);

    } catch (error) {
      console.error(
        "VTOP Session Keeper request error:",
        error
      );
    } finally {
      requestInProgress = false;
    }
  }

  browser.runtime.onMessage.addListener(message => {
    if (message.type === "VTOP_KEEPALIVE") {
      return sendCurriculumRequest();
    }
  });
})();
