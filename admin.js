// admin.js

import {
  auth,
  db
} from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// ======================================
// ELEMENT
// ======================================

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");

const templateModal = document.getElementById("templateModal");
const templateForm = document.getElementById("templateForm");

const addTemplateButton =
  document.getElementById("addTemplateButton");

const emptyAddButton =
  document.getElementById("emptyAddButton");

const closeModalButton =
  document.getElementById("closeModalButton");

const cancelButton =
  document.getElementById("cancelButton");

const templateList =
  document.getElementById("templateList");


// ======================================
// AUTH STATE
// ======================================

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginPage.classList.add("hidden");
    dashboardPage.classList.remove("hidden");

    loadTemplates();

  } else {

    loginPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");

  }

});


// ======================================
// LOGIN
// ======================================

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  loginError.textContent = "Memproses login...";

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    loginError.textContent = "";

  } catch (error) {

    console.error(error);

    loginError.textContent =
      getLoginError(error.code);

  }

});


// ======================================
// LOGIN ERROR
// ======================================

function getLoginError(code) {

  switch (code) {

    case "auth/invalid-credential":
      return "Email atau password salah.";

    case "auth/user-not-found":
      return "Akun admin tidak ditemukan.";

    case "auth/wrong-password":
      return "Password salah.";

    case "auth/invalid-email":
      return "Format email tidak valid.";

    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";

    case "auth/network-request-failed":
      return "Koneksi internet bermasalah.";

    default:
      return "Login gagal. Silakan coba lagi.";

  }

}


// ======================================
// LOGOUT
// ======================================

logoutButton.addEventListener("click", async () => {

  try {

    await signOut(auth);

  } catch (error) {

    console.error("Logout gagal:", error);

  }

});


// ======================================
// MODAL
// ======================================

addTemplateButton.addEventListener(
  "click",
  openAddModal
);

emptyAddButton.addEventListener(
  "click",
  openAddModal
);

closeModalButton.addEventListener(
  "click",
  closeModal
);

cancelButton.addEventListener(
  "click",
  closeModal
);

document
  .querySelector(".modal-overlay")
  .addEventListener("click", closeModal);


function openAddModal() {

  templateForm.reset();

  document.getElementById("editingId").value = "";

  document.getElementById("modalTitle").textContent =
    "Tambah Template";

  generateNextCode();

  templateModal.classList.remove("hidden");

}


function closeModal() {

  templateModal.classList.add("hidden");

}


// ======================================
// GENERATE EZ CODE
// ======================================

async function generateNextCode() {

  const snapshot =
    await getDocs(collection(db, "templates"));

  let nomorTerbesar = 0;

  snapshot.forEach((item) => {

    const data = item.data();

    if (!data.kode) return;

    const angka =
      parseInt(
        data.kode.replace("EZ", ""),
        10
      );

    if (!isNaN(angka) && angka > nomorTerbesar) {
      nomorTerbesar = angka;
    }

  });

  const nomorBaru = nomorTerbesar + 1;

  const kode =
    "EZ" +
    String(nomorBaru).padStart(3, "0");

  document.getElementById("kode").value = kode;

}


// ======================================
// GET CHECKBOX VALUES
// ======================================

function getCheckedValues(containerId) {

  return [
    ...document.querySelectorAll(
      `#${containerId} input[type="checkbox"]:checked`
    )
  ].map(
    checkbox => checkbox.value
  );

}


// ======================================
// SET CHECKBOX VALUES
// ======================================

function setCheckedValues(containerId, values = []) {

  const checkboxes =
    document.querySelectorAll(
      `#${containerId} input[type="checkbox"]`
    );

  checkboxes.forEach((checkbox) => {

    checkbox.checked =
      values.includes(checkbox.value);

  });

}


// ======================================
// SAVE TEMPLATE
// ======================================

templateForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const editingId =
      document.getElementById("editingId").value;

    const kode =
      document.getElementById("kode").value;

    const nama =
      document.getElementById("nama").value.trim();

    const preview =
      document.getElementById("preview").value.trim();

    const harga =
      Number(document.getElementById("harga").value);

    const tema =
      getCheckedValues("temaOptions");

    const untuk =
      getCheckedValues("untukOptions");

    const acara =
      getCheckedValues("acaraOptions");

    const fitur =
      getCheckedValues("fiturOptions");

    const status =
      document.getElementById("status").value;


    if (!nama || !preview || harga < 0) {

      alert("Lengkapi informasi template terlebih dahulu.");

      return;

    }


    const data = {

      kode,
      nama,
      preview,
      harga,

      tema,
      untuk,
      acara,
      fitur,

      status,

      diperbaruiPada: serverTimestamp()

    };


    try {

      if (editingId) {

        // EDIT

        await updateDoc(
          doc(db, "templates", editingId),
          data
        );

        alert("Template berhasil diperbarui.");

      } else {

        // TAMBAH

        data.dibuatPada =
          serverTimestamp();

        await addDoc(
          collection(db, "templates"),
          data
        );

        alert("Template berhasil ditambahkan.");

      }


      closeModal();

      await loadTemplates();


    } catch (error) {

      console.error(
        "Gagal menyimpan template:",
        error
      );

      alert(
        "Gagal menyimpan template.\n\n" +
        error.message
      );

    }

  }
);


// ======================================
// LOAD TEMPLATES
// ======================================

async function loadTemplates() {

  templateList.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">...</div>
      <h3>Memuat template...</h3>
      <p>Mohon tunggu sebentar.</p>
    </div>
  `;


  try {

    const snapshot =
      await getDocs(
        collection(db, "templates")
      );


    const templates = [];

    snapshot.forEach((item) => {

      templates.push({
        id: item.id,
        ...item.data()
      });

    });


    templates.sort((a, b) => {

      const angkaA =
        parseInt(
          (a.kode || "").replace("EZ", ""),
          10
        ) || 0;

      const angkaB =
        parseInt(
          (b.kode || "").replace("EZ", ""),
          10
        ) || 0;

      return angkaA - angkaB;

    });


    updateStats(templates);

    renderTemplates(templates);


  } catch (error) {

    console.error(
      "Gagal mengambil template:",
      error
    );

    templateList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Gagal memuat data</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;

  }

}


// ======================================
// UPDATE STATS
// ======================================

function updateStats(templates) {

  const total =
    templates.length;

  const aktif =
    templates.filter(
      item => item.status === "aktif"
    ).length;

  const nonaktif =
    total - aktif;


  document.getElementById(
    "totalTemplates"
  ).textContent = total;

  document.getElementById(
    "activeTemplates"
  ).textContent = aktif;

  document.getElementById(
    "inactiveTemplates"
  ).textContent = nonaktif;

  document.getElementById(
    "templateCount"
  ).textContent = total;

}


// ======================================
// RENDER
// ======================================

function renderTemplates(templates) {

  if (!templates.length) {

    templateList.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">✦</div>

        <h3>Belum ada template</h3>

        <p>
          Tambahkan template pertama EzzTify kamu.
        </p>

        <button
          class="add-button"
          id="emptyAddButton2"
        >
          + Tambah Template
        </button>

      </div>
    `;

    document
      .getElementById("emptyAddButton2")
      .addEventListener(
        "click",
        openAddModal
      );

    return;

  }


  templateList.innerHTML =
    templates.map(template => `

      <div class="template-row">

        <div class="template-code">
          ${escapeHtml(template.kode || "-")}
        </div>

        <div>

          <div class="template-name">
            ${escapeHtml(template.nama || "-")}
          </div>

          <div class="template-meta">
            ${formatRupiah(template.harga)}
          </div>

        </div>

        <div class="template-meta">
          ${escapeHtml(
            (template.tema || []).slice(0, 2).join(", ")
          )}
        </div>

        <div>

          <span class="
            status-badge
            ${
              template.status === "aktif"
                ? "status-active"
                : "status-inactive"
            }
          ">
            ${
              template.status === "aktif"
                ? "AKTIF"
                : "NONAKTIF"
            }
          </span>

        </div>

        <div class="row-actions">

          <button
            class="edit-button"
            data-action="edit"
            data-id="${template.id}"
          >
            Edit
          </button>

          <button
            class="delete-button"
            data-action="delete"
            data-id="${template.id}"
          >
            Hapus
          </button>

        </div>

      </div>

    `).join("");


  document
    .querySelectorAll("[data-action='edit']")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => editTemplate(button.dataset.id)
      );

    });


  document
    .querySelectorAll("[data-action='delete']")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => deleteTemplate(button.dataset.id)
      );

    });

}


// ======================================
// EDIT TEMPLATE
// ======================================

async function editTemplate(id) {

  try {

    const snapshot =
      await getDocs(
        collection(db, "templates")
      );

    let template = null;

    snapshot.forEach(item => {

      if (item.id === id) {

        template = {
          id: item.id,
          ...item.data()
        };

      }

    });


    if (!template) {

      alert("Template tidak ditemukan.");

      return;

    }


    document.getElementById("editingId").value =
      template.id;

    document.getElementById("kode").value =
      template.kode || "";

    document.getElementById("nama").value =
      template.nama || "";

    document.getElementById("preview").value =
      template.preview || "";

    document.getElementById("harga").value =
      template.harga || 0;

    document.getElementById("status").value =
      template.status || "aktif";


    setCheckedValues(
      "temaOptions",
      template.tema
    );

    setCheckedValues(
      "untukOptions",
      template.untuk
    );

    setCheckedValues(
      "acaraOptions",
      template.acara
    );

    setCheckedValues(
      "fiturOptions",
      template.fitur
    );


    document.getElementById(
      "modalTitle"
    ).textContent = "Edit Template";


    templateModal.classList.remove(
      "hidden"
    );


  } catch (error) {

    console.error(error);

    alert(
      "Gagal mengambil data template."
    );

  }

}


// ======================================
// DELETE
// ======================================

async function deleteTemplate(id) {

  const yakin =
    confirm(
      "Yakin ingin menghapus template ini?"
    );

  if (!yakin) return;


  try {

    await deleteDoc(
      doc(db, "templates", id)
    );

    alert("Template berhasil dihapus.");

    await loadTemplates();


  } catch (error) {

    console.error(error);

    alert(
      "Gagal menghapus template.\n\n" +
      error.message
    );

  }

}


// ======================================
// RUPIAH
// ======================================

function formatRupiah(angka) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(angka || 0);

}


// ======================================
// SECURITY: ESCAPE HTML
// ======================================

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}