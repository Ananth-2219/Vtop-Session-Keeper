const toggle = document.getElementById("enabled");
const status = document.getElementById("status");

async function refresh() {
  const saved = await browser.storage.local.get({ enabled: true });
  toggle.checked = saved.enabled !== false;
  const tabs = await browser.tabs.query({url: "https://vtop.vit.ac.in/vtop/*"});
  status.textContent = !toggle.checked
    ? "Disabled."
    : tabs.length === 0
      ? "Enabled. Waiting for a VTOP tab."
      : `Enabled. Monitoring ${tabs.length} VTOP tab(s).`;
}

toggle.addEventListener("change", async () => {
  await browser.storage.local.set({enabled: toggle.checked});
  await refresh();
});
refresh();
