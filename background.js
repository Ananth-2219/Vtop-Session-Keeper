const HOME_URL = "https://vtop.vit.ac.in/vtop/content";
const VTOP_MATCH = "https://vtop.vit.ac.in/vtop/*";
const ALARM_NAME = "vtop-session-keepalive";
const INTERVAL_MINUTES = 9;

async function enabled() {
  const value = await browser.storage.local.get({ enabled: true });
  return value.enabled !== false;
}

async function vtopTabs() {
  return browser.tabs.query({ url: VTOP_MATCH });
}

async function syncAlarm() {
  const on = await enabled();
  const tabs = on ? await vtopTabs() : [];
  if (!on || tabs.length === 0) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }
  if (!(await browser.alarms.get(ALARM_NAME))) {
    browser.alarms.create(ALARM_NAME, {
      delayInMinutes: INTERVAL_MINUTES,
      periodInMinutes: INTERVAL_MINUTES
    });
  }
}

async function keepSessionActive() {
  if (!(await enabled())) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }
  const tabs = await vtopTabs();
  if (tabs.length === 0) {
    await browser.alarms.clear(ALARM_NAME);
    return;
  }

  for (const tab of tabs) {
    if (typeof tab.id !== "number") continue;
    try {
      if (tab.url === HOME_URL) {
        await browser.tabs.reload(tab.id);
      } else {
        // Updating a background tab does not focus it.
        await browser.tabs.update(tab.id, { url: HOME_URL });
      }
    } catch (error) {
      console.warn("Could not navigate VTOP tab:", error);
    }
  }
}

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
browser.tabs.onRemoved.addListener(syncAlarm);
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.enabled) syncAlarm();
});
browser.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) keepSessionActive();
});
syncAlarm();
