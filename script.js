/* =========================================================
   EZZTIFY
   PUBLIC WEBSITE SCRIPT
========================================================= */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { db } from "./firebase.js";


/* =========================================================
   CONFIG
========================================================= */

// GANTI dengan nomor WhatsApp EzzTify kamu.
// Format: 628xxxxxxxxxx
const NOMOR_WHATSAPP = "628xxxxxxxxxx";


/* =========================================================
   STATE
========================================================= */

let semuaTemplate = [];

let filterAktif = {
    tema: "Semua",
    untuk: "Semua",
    acara: "Semua"
};


/* =========================================================
   DOM
========================================================= */

const templateGrid = document.getElementById("templateGrid");
const templateCount = document.getElementById("templateCount");

const emptyState = document.getElementById("emptyState");

const resetFilterButton = document.getElementById("resetFilter");
const emptyResetButton = document.getElementById("emptyResetButton");

const templateModal = document.getElementById("templateModal");
const modalClose = document.getElementById("modalClose");

const modalCode = document.getElementById("modalCode");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");

const modalPreviewName =
    document.getElementById("modalPreviewName");

const modalTema =
    document.getElementById("modalTema");

const modalUntuk =
    document.getElementById("modalUntuk");

const modalAcara =
    document.getElementById("modalAcara");

const modalFitur =
    document.getElementById("modalFitur");

const modalPreviewButton =
    document.getElementById("modalPreviewButton");

const modalOrderButton =
    document.getElementById("modalOrderButton");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const currentYear =
    document.getElementById("currentYear");

const footerWhatsApp =
    document.getElementById("footerWhatsApp");


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    setupFilterButtons();
    setupNavigation();
    setupModal();
    setupResetButtons();
    setupFooterWhatsApp();

    await ambilTemplate();

});


/* =========================================================
   FIREBASE — LOAD TEMPLATES
========================================================= */

async function ambilTemplate() {

    tampilkanLoading();

    try {

        const templatesRef =
            collection(db, "templates");

        const templatesQuery = query(
            templatesRef,
            where("status", "==", "aktif")
        );

        const snapshot =
            await getDocs(templatesQuery);

        semuaTemplate = [];

        snapshot.forEach((docSnapshot) => {

            const data = docSnapshot.data();

            semuaTemplate.push({
                id: docSnapshot.id,
                ...data
            });

        });


        /*
         * Urutkan berdasarkan angka pada kode.
         *
         * EZ001
         * EZ002
         * EZ003
         */

        semuaTemplate.sort((a, b) => {

            const angkaA =
                ambilNomorKode(a.kode);

            const angkaB =
                ambilNomorKode(b.kode);

            return angkaA - angkaB;

        });


        tampilkanTemplate();

    } catch (error) {

        console.error(
            "Gagal mengambil template:",
            error
        );

        tampilkanError();

    }

}


/* =========================================================
   AMBIL NOMOR DARI KODE
========================================================= */

function ambilNomorKode(kode) {

    if (!kode) {
        return 0;
    }

    const hasil =
        String(kode).match(/\d+/);

    if (!hasil) {
        return 0;
    }

    return Number(hasil[0]);

}


/* =========================================================
   FILTER
========================================================= */

function setupFilterButtons() {

    const buttons =
        document.querySelectorAll(
            ".filter-button"
        );


    buttons.forEach((button) => {

        button.addEventListener("click", () => {

            const tipe =
                button.dataset.filterType;

            const nilai =
                button.dataset.value;


            filterAktif[tipe] = nilai;


            /*
             * Tombol "Semua"
             * hanya aktif sendiri.
             */

            const group =
                button.closest(".filter-buttons");

            if (group) {

                group
                    .querySelectorAll(".filter-button")
                    .forEach((item) => {

                        item.classList.remove(
                            "active"
                        );

                    });

            }

            button.classList.add("active");

            tampilkanTemplate();

        });

    });

}


/* =========================================================
   FILTER DATA
========================================================= */

function filterTemplate() {

    return semuaTemplate.filter((template) => {

        const cocokTema =
            filterAktif.tema === "Semua" ||
            arrayMengandung(
                template.tema,
                filterAktif.tema
            );


        const cocokUntuk =
            filterAktif.untuk === "Semua" ||
            arrayMengandung(
                template.untuk,
                filterAktif.untuk
            );


        const cocokAcara =
            filterAktif.acara === "Semua" ||
            arrayMengandung(
                template.acara,
                filterAktif.acara
            );


        return (
            cocokTema &&
            cocokUntuk &&
            cocokAcara
        );

    });

}


/* =========================================================
   CEK ARRAY
========================================================= */

function arrayMengandung(array, nilai) {

    if (!Array.isArray(array)) {
        return false;
    }

    return array.some((item) => {

        return String(item).toLowerCase() ===
            String(nilai).toLowerCase();

    });

}


/* =========================================================
   RENDER TEMPLATE
========================================================= */

function tampilkanTemplate() {

    const hasil =
        filterTemplate();


    templateGrid.innerHTML = "";

    emptyState.classList.add("hidden");


    templateCount.textContent =
        `${hasil.length} template tersedia`;


    if (hasil.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    hasil.forEach((template) => {

        const card =
            buatTemplateCard(template);

        templateGrid.appendChild(card);

    });

}


/* =========================================================
   BUAT CARD
========================================================= */

function buatTemplateCard(template) {

    const card =
        document.createElement("article");

    card.className =
        "template-card";


    const nama =
        escapeHTML(
            template.nama || "Template EzzTify"
        );


    const kode =
        escapeHTML(
            template.kode || "EZ000"
        );


    const harga =
        formatRupiah(template.harga);


    const tema =
        Array.isArray(template.tema)
            ? template.tema
            : [];


    const untuk =
        Array.isArray(template.untuk)
            ? template.untuk
            : [];


    const acara =
        Array.isArray(template.acara)
            ? template.acara
            : [];


    /*
     * Ambil maksimal 3 tag
     */

    const semuaTag = [
        ...tema,
        ...untuk,
        ...acara
    ];

    const tagUnik =
        [...new Set(semuaTag)]
            .slice(0, 3);


    const tagsHTML =
        tagUnik.map((tag) => {

            return `
                <span class="template-tag">
                    ${escapeHTML(tag)}
                </span>
            `;

        }).join("");


    card.innerHTML = `

        <div class="template-visual">

            <span class="template-number">
                ${kode}
            </span>

            <div class="template-mini-browser">

                <div class="mini-browser-top">

                    <div class="mini-browser-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                </div>

                <div class="mini-browser-content">

                    <div class="mini-label">
                        EZZTIFY TEMPLATE
                    </div>

                    <div class="mini-title">
                        ${nama}
                    </div>

                    <div class="mini-symbol">
                        ✦
                    </div>

                </div>

            </div>

        </div>


        <div class="template-information">

            <div class="template-name-row">

                <h3 class="template-name">
                    ${nama}
                </h3>

                <span class="template-price">
                    ${harga}
                </span>

            </div>


            <p class="template-description">
                Website ucapan digital yang dapat
                dipersonalisasi sesuai momenmu.
            </p>


            <div class="template-tags">
                ${tagsHTML}
            </div>


            <div class="template-actions">

                <button
                    class="template-view-button"
                    data-action="detail"
                >
                    Lihat Detail
                </button>

                <button
                    class="template-order-button"
                    data-action="order"
                >
                    Pesan ↗
                </button>

            </div>

        </div>

    `;


    const detailButton =
        card.querySelector(
            '[data-action="detail"]'
        );

    const orderButton =
        card.querySelector(
            '[data-action="order"]'
        );


    detailButton.addEventListener(
        "click",
        () => bukaModal(template)
    );


    orderButton.addEventListener(
        "click",
        () => pesanTemplate(template)
    );


    return card;

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(nilai) {

    const angka =
        Number(nilai) || 0;


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(angka);

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            tutupModal
        );

    }


    if (templateModal) {

        templateModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    templateModal
                ) {

                    tutupModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !templateModal.classList.contains(
                    "hidden"
                )
            ) {

                tutupModal();

            }

        }
    );


    if (modalOrderButton) {

        modalOrderButton.addEventListener(
            "click",
            () => {

                if (window.templateYangSedangDilihat) {

                    pesanTemplate(
                        window.templateYangSedangDilihat
                    );

                }

            }
        );

    }

}


/* =========================================================
   BUKA MODAL
========================================================= */

function bukaModal(template) {

    window.templateYangSedangDilihat =
        template;


    const nama =
        template.nama ||
        "Template EzzTify";


    modalCode.textContent =
        template.kode || "EZ000";


    modalTitle.textContent =
        nama;


    modalPreviewName.textContent =
        nama;


    modalPrice.textContent =
        formatRupiah(
            template.harga
        );


    isiTagModal(
        modalTema,
        template.tema
    );


    isiTagModal(
        modalUntuk,
        template.untuk
    );


    isiTagModal(
        modalAcara,
        template.acara
    );


    isiTagModal(
        modalFitur,
        template.fitur
    );


    const preview =
        template.preview || "#";


    modalPreviewButton.href =
        preview;


    if (!preview || preview === "#") {

        modalPreviewButton.style.opacity =
            "0.5";

        modalPreviewButton.style.pointerEvents =
            "none";

    } else {

        modalPreviewButton.style.opacity =
            "1";

        modalPreviewButton.style.pointerEvents =
            "auto";

    }


    templateModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ISI TAG MODAL
========================================================= */

function isiTagModal(element, data) {

    if (!element) {
        return;
    }


    if (!Array.isArray(data) || data.length === 0) {

        element.innerHTML = `
            <span class="modal-tag">
                —
            </span>
        `;

        return;

    }


    element.innerHTML =
        data.map((item) => {

            return `
                <span class="modal-tag">
                    ${escapeHTML(item)}
                </span>
            `;

        }).join("");

}


/* =========================================================
   TUTUP MODAL
========================================================= */

function tutupModal() {

    templateModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

    window.templateYangSedangDilihat =
        null;

}


/* =========================================================
   WHATSAPP
========================================================= */

function pesanTemplate(template) {

    if (!template) {
        return;
    }


    const nama =
        template.nama ||
        "Template";


    const kode =
        template.kode ||
        "EZ000";


    const pesan =
        `Halo EzzTify, apakah saya bisa memesan template ${nama} (${kode})?`;


    const url =
        `https://wa.me/${NOMOR_WHATSAPP}?text=${encodeURIComponent(
            pesan
        )}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   FOOTER WHATSAPP
========================================================= */

function setupFooterWhatsApp() {

    if (!footerWhatsApp) {
        return;
    }


    footerWhatsApp.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const pesan =
                "Halo EzzTify, saya ingin bertanya mengenai template website.";


            const url =
                `https://wa.me/${NOMOR_WHATSAPP}?text=${encodeURIComponent(
                    pesan
                )}`;


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

}


/* =========================================================
   RESET FILTER
========================================================= */

function setupResetButtons() {

    if (resetFilterButton) {

        resetFilterButton.addEventListener(
            "click",
            resetSemuaFilter
        );

    }


    if (emptyResetButton) {

        emptyResetButton.addEventListener(
            "click",
            resetSemuaFilter
        );

    }

}


function resetSemuaFilter() {

    filterAktif = {
        tema: "Semua",
        untuk: "Semua",
        acara: "Semua"
    };


    document
        .querySelectorAll(".filter-button")
        .forEach((button) => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.value ===
                "Semua"
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    tampilkanTemplate();

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupNavigation() {

    if (!mobileMenuBtn || !mobileMenu) {
        return;
    }


    mobileMenuBtn.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "active"
            );

        }
    );


    mobileMenu
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "active"
                    );

                }
            );

        });

}


/* =========================================================
   LOADING
========================================================= */

function tampilkanLoading() {

    templateGrid.innerHTML = `

        <div class="loading-state">

            <div class="loading-spinner"></div>

            <p>
                Menyiapkan template...
            </p>

        </div>

    `;

}


/* =========================================================
   ERROR
========================================================= */

function tampilkanError() {

    templateGrid.innerHTML = `

        <div class="loading-state">

            <div class="empty-icon">
                !
            </div>

            <p>
                Template gagal dimuat.
            </p>

            <small style="
                margin-top: 6px;
                color: #94a3a2;
                font-size: 10px;
            ">
                Periksa koneksi Firebase dan
                Firestore Rules.
            </small>

        </div>

    `;


    templateCount.textContent =
        "Gagal memuat template";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}