
const VTOP_MATCH = "https://vtop.vit.ac.in/vtop/*";
const ALARM_NAME = "vtop-inactivity-check";
const INACTIVITY_MS = 9 * 60 * 1000;

async function isEnabled() {
  const result = await browser.storage.local.get({ enabled: true });
  return result.enabled !== false;
}

async function syncAlarm() {
  if (!(await isEnabled())) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }

  const tabs = await browser.tabs.query({ url: VTOP_MATCH });

  if (tabs.length === 0) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }

  if (!(await browser.alarms.get(ALARM_NAME))) {
    browser.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1
    });
  }
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type !== "VTOP_ACTIVITY") return;

  if (typeof sender.tab?.id !== "number") return;

  await browser.storage.local.set({
    [`lastActivity_${sender.tab.id}`]: Date.now()
  });
});

async function checkInactivity() {
  if (!(await isEnabled())) return;

  const tabs = await browser.tabs.query({ url: VTOP_MATCH });

  for (const tab of tabs) {
    if (typeof tab.id !== "number") continue;

    const key = `lastActivity_${tab.id}`;
    const saved = await browser.storage.local.get(key);

    if (typeof saved[key] !== "number") {
      await browser.storage.local.set({
        [key]: Date.now()
      });
      continue;
    }

    const inactiveFor = Date.now() - saved[key];

    if (inactiveFor >= INACTIVITY_MS) {
      // Reset the timestamp before sending the request to avoid
      // repeated triggers while the page is processing it.
      await browser.storage.local.set({
        [key]: Date.now()
      });

      try {
        await browser.tabs.sendMessage(tab.id, {
          type: "VTOP_KEEPALIVE"
        });
      } catch (error) {
        console.warn("Could not contact VTOP tab:", error);
      }
    }
  }
}

browser.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) {
    checkInactivity();
  }
});

browser.runtime.onInstalled.addListener(async () => {
  const saved = await browser.storage.local.get("enabled");

  if (typeof saved.enabled !== "boolean") {
    await browser.storage.local.set({ enabled: true });
  }

  await syncAlarm();
});

browser.runtime.onStartup.addListener(syncAlarm);

browser.tabs.onCreated.addListener(syncAlarm);
browser.tabs.onUpdated.addListener((_id, change) => {
  if (change.url) syncAlarm();
});
browser.tabs.onRemoved.addListener(async tabId => {
  await browser.storage.local.remove(`lastActivity_${tabId}`);
  await syncAlarm();
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) {
    syncAlarm();
  }
});

syncAlarm();
