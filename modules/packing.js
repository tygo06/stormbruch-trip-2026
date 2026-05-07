import {
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  createAvatar,
  emptyState,
  getAuthor,
  getDisplayName
} from "./utils.js";

export function initPacking({
  els,
  paths,
  state,
  requireProfile,
  onStatsChange,
  ami
}) {
  let packingMode = "shared";
  let editingItem = null;
  let selectedPriority = "1";

  function getCurrentList() {
    const profile = state.getCurrentProfile();

    if (packingMode === "shared") {
      return state.packingItems;
    }

    return [
      ...state.privatePackingItems,
      ...state.packingItems.filter((item) => item.authorId === profile?.id)
    ];
  }

  function renderPackingList() {
    els.packList.innerHTML = "";

    const list = getCurrentList();

    if (!list.length) {
      els.packList.append(
        emptyState(
          packingMode === "shared"
            ? "Nog niks op de paklijst."
            : "Je prive paklijst is leeg."
        )
      );
      return;
    }

    list.forEach((item) => {
      const li = document.createElement("li");
      li.className = item.done ? "done" : "";

      const author = getAuthor(
        state.crew,
        item.authorId,
        item.authorName,
        item.authorAvatar
      );

      const content = document.createElement("div");
      content.className = "packing-content";

      const label = document.createElement("label");
      label.className = "check-row";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(item.done);
      checkbox.addEventListener("change", () => togglePackingItem(item, !item.done));

      const textWrap = document.createElement("div");
      textWrap.className = "item-text";

      const title = document.createElement("span");
      title.className = "item-title";
      title.textContent = `${priorityPrefix(item.priority)}${item.text}`;

      if (item.description) {
        const desc = document.createElement("small");
        desc.className = "item-desc";
        desc.textContent = item.description;
        textWrap.append(title, desc);
      } else {
        textWrap.append(title);
      }

      label.append(checkbox, textWrap);
      content.append(label);

      if (packingMode === "private") {
        const tag = document.createElement("small");
        tag.className = "item-tag";
        tag.textContent = item.ownerId ? "prive" : "gedeeld";
        content.append(tag);
      }

      if (packingMode === "shared") {
        const addedBy = document.createElement("small");
        addedBy.className = "added-by";
        addedBy.append(
          createAvatar(author, "avatar-circle tiny"),
          document.createTextNode(`Toegevoegd door ${getDisplayName(author)}`)
        );
        content.append(addedBy);
      }

      const optionsBtn = document.createElement("button");
      optionsBtn.type = "button";
      optionsBtn.className = "icon-button";
      optionsBtn.textContent = "⚙";
      optionsBtn.addEventListener("click", () => openItemOptions(item));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-button";
      remove.textContent = "x";
      remove.addEventListener("click", () => {
        deleteDoc(doc(getCollectionForItem(item), item.id));
      });

      li.append(content, optionsBtn, remove);
      els.packList.append(li);
    });
  }

  async function addPackingItem(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    ami?.jump();
    ami?.speak("hmm...");

    const profile = requireProfile();
    if (!profile) return;

    const user = state.currentUser;
    const data = {
      text: trimmed,
      done: false,
      authorUid: user.uid,
      authorId: profile.id,
      authorName: profile.name,
      authorAvatar: profile.avatar || "",
      createdAt: serverTimestamp()
    };

    if (packingMode === "shared") {
      await addDoc(paths.packing, data);
    } else {
      await addDoc(paths.privatePacking, {
        ...data,
        ownerId: profile.id
      });
    }
  }

  async function togglePackingItem(item, done) {
    if (done) {
      ami?.jump();
      ami?.speak("nice");
    }

    await updateDoc(doc(getCollectionForItem(item), item.id), { done });
  }

  async function clearPackedItems() {
    await Promise.all(
      state.packingItems
        .filter((item) => item.done)
        .map((item) => deleteDoc(doc(paths.packing, item.id)))
    );
  }

  async function updateItem(item, text, description, priority) {
    await updateDoc(doc(getCollectionForItem(item), item.id), {
      text,
      description,
      priority
    });
  }

  function getCollectionForItem(item) {
    return item.ownerId ? paths.privatePacking : paths.packing;
  }

  function priorityPrefix(priority) {
    if (priority === "3") return "!!! ";
    if (priority === "2") return "!! ";
    if (priority === "1") return "! ";
    return "";
  }

  function openItemOptions(item) {
    editingItem = item;

    document.getElementById("itemModal").classList.remove("hidden");
    document.getElementById("itemName").value = item.text || "";
    document.getElementById("itemDesc").value = item.description || "";

    selectedPriority = item.priority || "1";
    document.querySelectorAll(".priority-buttons button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === selectedPriority);
    });
  }

  function closeItemModal() {
    document.getElementById("itemModal").classList.add("hidden");
    editingItem = null;
  }

  function updatePackingTabs() {
    document.getElementById("tabShared")?.classList.toggle("active", packingMode === "shared");
    document.getElementById("tabPrivate")?.classList.toggle("active", packingMode === "private");
  }

  function bindEvents() {
    els.packForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await addPackingItem(els.packInput.value);
      els.packInput.value = "";
      els.packInput.focus();
    });

    els.clearPackedButton.addEventListener("click", clearPackedItems);

    document.getElementById("tabShared")?.addEventListener("click", () => {
      packingMode = "shared";
      updatePackingTabs();
      renderPackingList();
      onStatsChange?.();
    });

    document.getElementById("tabPrivate")?.addEventListener("click", () => {
      packingMode = "private";
      updatePackingTabs();
      renderPackingList();
      onStatsChange?.();
    });

    document.querySelectorAll(".priority-buttons button").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPriority = btn.dataset.value;
        document.querySelectorAll(".priority-buttons button").forEach((button) => {
          button.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });

    document.getElementById("saveItem")?.addEventListener("click", async () => {
      if (!editingItem) return;

      await updateItem(
        editingItem,
        document.getElementById("itemName").value,
        document.getElementById("itemDesc").value,
        selectedPriority
      );

      closeItemModal();
    });

    document.getElementById("cancelItem")?.addEventListener("click", closeItemModal);
    document.getElementById("itemModal")?.addEventListener("click", (event) => {
      if (event.target.id === "itemModal") {
        closeItemModal();
      }
    });
  }

  bindEvents();
  updatePackingTabs();

  return {
    renderPackingList
  };
}
