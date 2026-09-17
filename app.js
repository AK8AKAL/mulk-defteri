// ============================================================
// Mülk Defteri — uygulama mantığı
// ============================================================

let buildings = [];      // Firestore 'buildings' koleksiyonunun canlı kopyası
let properties = [];     // Firestore 'properties' koleksiyonunun canlı kopyası
let unsubBuildings = null;
let unsubProperties = null;
let firstBuildingsSnapshot = true;

let currentBuildingId = null;   // bina detay ekranında hangi bina gösteriliyor

let currentPropertyFilter = "all";
let currentSearchTerm = "";

// ------------------------------------------------------------
// Yardımcı fonksiyonlar
// ------------------------------------------------------------
const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
function formatCurrency(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return tl.format(n);
}
function formatDateTR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function el(id) { return document.getElementById(id); }
function showToast(msg) {
  const t = el("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { t.hidden = true; }, 2600);
}
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}
function badgeClass(durum) {
  if (durum === "Kirada") return "badge--Kirada";
  if (durum === "Boş") return "badge--Boş";
  return "badge--ozel";
}
function buildingById(id) { return buildings.find(b => b.id === id); }
function propertiesOf(buildingId) { return properties.filter(p => p.buildingId === buildingId); }

// ============================================================
// KİMLİK DOĞRULAMA
// ============================================================
let authMode = "login"; // "login" | "signup"

el("auth-toggle").addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";
  el("auth-submit").textContent = authMode === "login" ? "Giriş yap" : "Hesap oluştur";
  el("auth-toggle").textContent = authMode === "login"
    ? "Hesabınız yok mu? Hesap oluşturun"
    : "Zaten hesabınız var mı? Giriş yapın";
  el("auth-error").hidden = true;
});

el("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = el("auth-email").value.trim();
  const password = el("auth-password").value;
  const errorBox = el("auth-error");
  errorBox.hidden = true;
  el("auth-submit").disabled = true;
  try {
    if (authMode === "login") {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      await auth.createUserWithEmailAndPassword(email, password);
    }
  } catch (err) {
    errorBox.textContent = translateAuthError(err);
    errorBox.hidden = false;
  } finally {
    el("auth-submit").disabled = false;
  }
});

function translateAuthError(err) {
  const map = {
    "auth/invalid-email": "Geçersiz e-posta adresi.",
    "auth/user-not-found": "Bu e-posta ile bir hesap bulunamadı.",
    "auth/wrong-password": "Şifre hatalı.",
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
  };
  return map[err.code] || "Bir hata oluştu, tekrar deneyin.";
}

el("logout-btn").addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged(user => {
  if (user) {
    el("auth-screen").hidden = true;
    el("app-shell").hidden = false;
    attachFirestoreListeners();
  } else {
    el("app-shell").hidden = true;
    el("auth-screen").hidden = false;
    if (unsubBuildings) unsubBuildings();
    if (unsubProperties) unsubProperties();
    buildings = [];
    properties = [];
  }
});

// ============================================================
// FIRESTORE — CANLI DİNLEYİCİLER
// ============================================================
function attachFirestoreListeners() {
  unsubBuildings = db.collection("buildings").orderBy("ad").onSnapshot(snap => {
    buildings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAll();
  }, err => showToast("Bina verileri okunamadı: " + err.message));

  unsubProperties = db.collection("properties").onSnapshot(snap => {
    properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAll();
  }, err => showToast("Mülk verileri okunamadı: " + err.message));
}

function renderAll() {
  renderDashboard();
  renderBuildingsList();
  if (currentBuildingId) renderBuildingDetail(currentBuildingId);
  renderAllProperties();
}

// ============================================================
// SEKME NAVİGASYONU
// ============================================================
const viewTitles = { panel: "Panel", buildings: "Binalar", "building-detail": "Bina Detayı", properties: "Mülkler" };

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
  el("view-" + name).classList.add("view--active");
  el("page-title").textContent = viewTitles[name];
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--active"));
  const tabName = name === "building-detail" ? "buildings" : name;
  const tabBtn = document.querySelector(`.tab[data-view="${tabName}"]`);
  if (tabBtn) tabBtn.classList.add("tab--active");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

el("back-to-buildings").addEventListener("click", () => {
  currentBuildingId = null;
  showView("buildings");
});

// ============================================================
// PANEL (DASHBOARD)
// ============================================================
function renderDashboard() {
  const rented = properties.filter(p => p.durum === "Kirada");
  const vacant = properties.filter(p => p.durum === "Boş");
  const priv = properties.filter(p => p.durum === "Özel Kullanım");
  const income = rented.reduce((sum, p) => sum + (Number(p.kiraBedeli) || 0), 0);

  el("stat-income").textContent = formatCurrency(income);
  el("stat-buildings").textContent = buildings.length;
  el("stat-properties").textContent = properties.length;
  el("stat-vacant").textContent = vacant.length;
  el("count-rented").textContent = rented.length;
  el("count-vacant").textContent = vacant.length;
  el("count-private").textContent = priv.length;
}

// ============================================================
// BİNALAR LİSTESİ
// ============================================================
function renderBuildingsList() {
  const box = el("buildings-list");
  if (buildings.length === 0) {
    box.innerHTML = `<div class="empty-state">Henüz bina eklenmedi.</div>`;
    return;
  }
  const sorted = [...buildings].sort((a, b) => propertiesOf(b.id).length - propertiesOf(a.id).length);
  box.innerHTML = sorted.map(b => {
    const props = propertiesOf(b.id);
    const total = props.length || 1;
    const rented = props.filter(p => p.durum === "Kirada").length;
    const vacant = props.filter(p => p.durum === "Boş").length;
    const priv = props.filter(p => p.durum === "Özel Kullanım").length;
    const pct = n => (n / total * 100).toFixed(1);
    return `<div class="building-card" data-id="${b.id}">
      <h3>${escapeHtml(b.ad)}</h3>
      <div class="addr">${escapeHtml(b.ilce)} / ${escapeHtml(b.il)} · ${props.length} mülk</div>
      <div class="occ-bar">
        <span style="width:${pct(rented)}%; background:var(--rented)"></span>
        <span style="width:${pct(vacant)}%; background:var(--vacant)"></span>
        <span style="width:${pct(priv)}%; background:var(--private)"></span>
      </div>
      <div class="occ-meta"><span>${rented} kirada</span><span>${vacant} boş</span><span>${priv} özel</span></div>
    </div>`;
  }).join("");

  box.querySelectorAll(".building-card").forEach(card => {
    card.addEventListener("click", () => {
      currentBuildingId = card.dataset.id;
      renderBuildingDetail(currentBuildingId);
      showView("building-detail");
    });
  });
}

// ============================================================
// BİNA DETAYI
// ============================================================
function renderBuildingDetail(id) {
  const b = buildingById(id);
  if (!b) { currentBuildingId = null; showView("buildings"); return; }
  const props = propertiesOf(id).sort((a, b2) => (a.kat || "").localeCompare(b2.kat || "", "tr"));

  el("building-detail-card").innerHTML = `
    <h2>${escapeHtml(b.ad)}</h2>
    <div class="addr">${escapeHtml(b.mahalle || "")} Mah. · ${escapeHtml(b.ilce)} / ${escapeHtml(b.il)}</div>
    <dl class="detail-grid">
      <div><dt>Bina no</dt><dd>${escapeHtml(b.binaNo || "—")}</dd></div>
      <div><dt>Ada/Parsel</dt><dd>${escapeHtml(b.adaParsel || "—")}</dd></div>
      <div><dt>Yüzölçümü</dt><dd>${b.yuzolcumu ? b.yuzolcumu + " m²" : "—"}</dd></div>
      <div><dt>Mülk sayısı</dt><dd>${props.length}</dd></div>
    </dl>`;

  const list = el("building-properties-list");
  list.innerHTML = props.length
    ? props.map(p => propertyCardHtml(p, false)).join("")
    : `<div class="empty-state">Bu binaya henüz mülk eklenmedi.</div>`;
  attachPropertyCardHandlers(list);
}

el("edit-building-btn").addEventListener("click", () => {
  if (currentBuildingId) openBuildingModal(buildingById(currentBuildingId));
});

// ============================================================
// TÜM MÜLKLER
// ============================================================
el("property-search").addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  renderAllProperties();
});

document.querySelectorAll("#status-filters .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#status-filters .chip").forEach(c => c.classList.remove("chip--active"));
    chip.classList.add("chip--active");
    currentPropertyFilter = chip.dataset.filter;
    renderAllProperties();
  });
});

function renderAllProperties() {
  const box = el("all-properties-list");
  let list = properties.map(p => ({ ...p, building: buildingById(p.buildingId) }));

  if (currentPropertyFilter !== "all") {
    list = list.filter(p => p.durum === currentPropertyFilter);
  }
  if (currentSearchTerm) {
    list = list.filter(p => {
      const hay = [p.building ? p.building.ad : "", p.kiraci, p.nitelik].join(" ").toLowerCase();
      return hay.includes(currentSearchTerm);
    });
  }
  list.sort((a, b) => (a.building?.ad || "").localeCompare(b.building?.ad || "", "tr"));

  box.innerHTML = list.length
    ? list.map(p => propertyCardHtml(p, true)).join("")
    : `<div class="empty-state">Arama kriterlerine uyan mülk bulunamadı.</div>`;
  attachPropertyCardHandlers(box);
}

// ============================================================
// MÜLK KARTI — ORTAK ŞABLON
// ============================================================
function propertyCardHtml(p, showBuildingTag) {
  const b = buildingById(p.buildingId);
  const location = [p.kat, p.no].filter(Boolean).join(" · No ") || "—";
  const showRentRow = p.durum === "Kirada";
  return `<div class="property-card" data-id="${p.id}">
    <div class="p-top">
      <div>
        ${showBuildingTag && b ? `<div class="p-building-tag">${escapeHtml(b.ad)}</div>` : ""}
        <div class="p-name">${escapeHtml(p.nitelik)}${p.no ? " · No " + escapeHtml(p.no) : ""}</div>
        <div class="p-meta">${p.kat ? "Kat: " + escapeHtml(p.kat) : ""}${p.kiraci ? " · " + escapeHtml(p.kiraci) : ""}</div>
      </div>
      <span class="badge ${badgeClass(p.durum)}">${escapeHtml(p.durum)}</span>
    </div>
    ${showRentRow ? `<div class="p-detail-row">
        <span>Sözleşme: ${formatDateTR(p.sozlesme)}</span>
        <span class="p-rent">${formatCurrency(p.kiraBedeli)}/ay</span>
      </div>` : ""}
    <div class="p-actions">
      <button data-action="edit">Düzenle</button>
    </div>
  </div>`;
}

function attachPropertyCardHandlers(container) {
  container.querySelectorAll(".property-card").forEach(card => {
    const id = card.dataset.id;
    const property = properties.find(p => p.id === id);
    if (!property) return;
    card.querySelector('[data-action="edit"]').addEventListener("click", () => openPropertyModal(property.buildingId, property));
  });
}

// ============================================================
// MODAL: BİNA FORMU
// ============================================================
function openBuildingModal(building) {
  el("building-modal-title").textContent = "Binayı düzenle";
  el("building-id").value = building.id;
  el("b-ad").value = building.ad;
  el("b-il").value = building.il;
  el("b-ilce").value = building.ilce;
  el("b-mahalle").value = building.mahalle || "";
  el("b-binano").value = building.binaNo || "";
  el("b-adaparsel").value = building.adaParsel || "";
  el("b-yuzolcumu").value = building.yuzolcumu || "";
  el("building-modal").hidden = false;
}

el("building-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = el("building-id").value;
  const data = {
    ad: el("b-ad").value.trim(),
    il: el("b-il").value.trim(),
    ilce: el("b-ilce").value.trim(),
    mahalle: el("b-mahalle").value.trim(),
    binaNo: el("b-binano").value.trim(),
    adaParsel: el("b-adaparsel").value.trim(),
    yuzolcumu: el("b-yuzolcumu").value ? Number(el("b-yuzolcumu").value) : null,
  };
  try {
    await db.collection("buildings").doc(id).update(data);
    showToast("Bina güncellendi.");
    closeModals();
  } catch (err) {
    showToast("Kaydedilemedi: " + err.message);
  }
});

// ============================================================
// MODAL: MÜLK FORMU
// ============================================================
function toggleTenantFields() {
  const durum = el("p-durum").value;
  el("p-kira-field").style.display = durum === "Kirada" ? "flex" : "none";
  el("p-tarih-field").style.display = durum === "Kirada" ? "flex" : "none";
}
el("p-durum").addEventListener("change", toggleTenantFields);

function openPropertyModal(buildingId, property) {
  el("property-modal-title").textContent = "Mülkü düzenle";
  el("p-id").value = property.id;
  el("p-buildingid").value = buildingId;
  el("p-kat").value = property.kat || "";
  el("p-no").value = property.no || "";
  el("p-nitelik").value = property.nitelik || "";
  el("p-durum").value = property.durum;
  el("p-kiraci").value = property.kiraci || "";
  el("p-kirabedeli").value = property.kiraBedeli ? property.kiraBedeli : "";
  el("p-sozlesme").value = property.sozlesme || "";
  toggleTenantFields();
  el("property-modal").hidden = false;
}

el("property-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = el("p-id").value;
  const durum = el("p-durum").value;
  const data = {
    buildingId: el("p-buildingid").value,
    kat: el("p-kat").value.trim(),
    no: el("p-no").value.trim(),
    nitelik: el("p-nitelik").value.trim(),
    durum,
    kiraci: el("p-kiraci").value.trim(),
    kiraBedeli: durum === "Kirada" && el("p-kirabedeli").value ? Number(el("p-kirabedeli").value) : null,
    sozlesme: durum === "Kirada" && el("p-sozlesme").value ? el("p-sozlesme").value : null,
  };
  try {
    await db.collection("properties").doc(id).update(data);
    showToast("Mülk güncellendi.");
    closeModals();
  } catch (err) {
    showToast("Kaydedilemedi: " + err.message);
  }
});

// ============================================================
// MODAL KAPATMA (genel)
// ============================================================
function closeModals() {
  el("building-modal").hidden = true;
  el("property-modal").hidden = true;
}
document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", closeModals));
document.querySelectorAll(".sheet-overlay").forEach(overlay => {
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModals(); });
});
