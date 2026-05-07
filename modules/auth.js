import { auth } from "../firebase.js";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

export function initAuth({ els, onAuthState }) {
  async function handleLogin(event) {
    event.preventDefault();
    els.authError.textContent = "";

    try {
      await signInWithEmailAndPassword(
        auth,
        els.authEmail.value.trim(),
        els.authPassword.value
      );
      els.authForm.reset();
    } catch {
      els.authError.textContent = "Inloggen lukt niet. Check je email en wachtwoord.";
    }
  }

  async function handlePasswordChange() {
    const current = document.getElementById("currentPass")?.value || "";
    const newPass = document.getElementById("newPass")?.value || "";
    const confirm = document.getElementById("confirmPass")?.value || "";
    const errorEl = document.getElementById("settingsError");

    if (!errorEl) return;
    errorEl.style.color = "";
    errorEl.textContent = "";

    if (!current || !newPass || !confirm) {
      errorEl.textContent = "Vul alles in";
      return;
    }

    if (newPass !== confirm) {
      errorEl.textContent = "Nieuwe wachtwoorden komen niet overeen";
      return;
    }

    if (newPass.length < 6) {
      errorEl.textContent = "Minimaal 6 karakters";
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      errorEl.textContent = "Je bent niet ingelogd";
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);

      errorEl.style.color = "green";
      errorEl.textContent = "Wachtwoord gewijzigd";
      document.getElementById("currentPass").value = "";
      document.getElementById("newPass").value = "";
      document.getElementById("confirmPass").value = "";
    } catch (err) {
      console.error(err);
      errorEl.textContent =
        err.code === "auth/wrong-password"
          ? "Huidig wachtwoord klopt niet"
          : "Er ging iets mis";
    }
  }

  els.logoutButton.addEventListener("click", () => signOut(auth));
  els.authForm.addEventListener("submit", handleLogin);
  document.getElementById("savePassword")?.addEventListener("click", handlePasswordChange);

  return onAuthStateChanged(auth, onAuthState);
}
