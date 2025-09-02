let deferredPrompt;
const installBtn = document.getElementById("install-btn");
const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in one week

// Check last time prompt was shown
const lastPrompt = localStorage.getItem("lastInstallPrompt");
const now = Date.now();

if (!lastPrompt || now - lastPrompt > oneWeek) {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "flex"; // show the button
  });
}

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);

  // Hide button after choice
  installBtn.style.display = "none";
  deferredPrompt = null;

  // Store timestamp to show prompt only after a week
  localStorage.setItem("lastInstallPrompt", Date.now());
});