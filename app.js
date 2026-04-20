/* ==========================================
   Khanta Payment Reminder
   FINAL PRODUCTION app.js
========================================== */

/* ---------- App State ---------- */
let appData = [];
let isLoading = false;
let lastFetch = 0;
const CACHE_MS = 30000; // 30 seconds cache

/* ==========================================
   START
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    setYear();
    showPage("home");
    initNetworkBar();
});

/* ==========================================
   EVENTS
========================================== */
function setupEvents() {
    byId("homeBtn")?.addEventListener("click", () => showPage("home"));
    byId("addBtn")?.addEventListener("click", () => showPage("add"));
    byId("listBtn")?.addEventListener("click", () => showPage("list"));

    byId("saveBtn")?.addEventListener("click", saveReminder);

    byId("search")?.addEventListener(
        "input",
        debounce(() => renderRecords(appData), 220)
    );
}

/* ==========================================
   PAGE NAVIGATION
========================================== */
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    byId(pageId)?.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active-btn");
    });

    byId(pageId + "Btn")?.classList.add("active-btn");

    if (pageId === "home" || pageId === "list") {
        loadDataSmart();
    }
}

/* ==========================================
   SMART DATA LOADING
========================================== */
async function loadDataSmart() {
    const now = Date.now();

    if (appData.length && now - lastFetch < CACHE_MS) {
        renderDashboard(appData);
        renderRecords(appData);
        backgroundRefresh();
        return;
    }

    await fullRefresh();
}

async function fullRefresh() {
    if (isLoading) return;

    isLoading = true;

    if (!appData.length) {
        showLoader();
    }

    const data = await getRecordsAPI();

    isLoading = false;

    if (!data) {
        if (!appData.length) renderError();
        return;
    }

    appData = data;
    lastFetch = Date.now();

    renderDashboard(appData);
    renderRecords(appData);
}

async function backgroundRefresh() {
    if (isLoading) return;

    isLoading = true;

    const data = await getRecordsAPI();

    isLoading = false;

    if (!data) return;

    appData = data;
    lastFetch = Date.now();

    renderDashboard(appData);
    renderRecords(appData);
}

/* ==========================================
   SAVE REMINDER
========================================== */
async function saveReminder() {
    const payload = {
        name: val("name"),
        mobile: val("mobile"),
        amount: val("amount"),
        date: byId("date").value,
        note: val("note")
    };

    if (!payload.name || !payload.mobile || !payload.amount || !payload.date) {
        toast("Please fill all fields");
        return;
    }

    if (payload.mobile.length < 10 || isNaN(payload.mobile)) {
        toast("Enter valid mobile number");
        return;
    }

    if (Number(payload.amount) <= 0) {
        toast("Enter valid amount");
        return;
    }

    const btn = byId("saveBtn");
    btn.disabled = true;
    btn.innerText = "Saving...";

    const ok = await addRecordAPI(payload);

    btn.disabled = false;
    btn.innerText = "💾 Save Reminder";

    if (!ok) {
        toast("Save Failed");
        return;
    }

    clearForm();
    toast("Saved Successfully");
    vibrate(50);

    await fullRefresh();
    showPage("home");
}

/* ==========================================
   DASHBOARD
========================================== */
function renderDashboard(data) {
    const today = isoToday();

    let total = data.length;
    let pending = 0;
    let due = 0;
    let paid = 0;

    data.forEach(r => {
        if (r.status !== "Paid") pending += Number(r.amount);
        if (r.status === "Paid") paid++;
        if (r.date === today && r.status !== "Paid") due++;
    });

    text("totalCustomers", total);
    text("pendingAmount", "₹" + pending);
    text("dueToday", due);
    text("paidCount", paid);
}

/* ==========================================
   RECORDS LIST
========================================== */
function renderRecords(data) {
    const box = byId("records");
    if (!box) return;

    const search = byId("search")
        ? byId("search").value.toLowerCase()
        : "";

    const today = isoToday();

    let html = "";

    [...data].reverse().forEach(r => {
        const txt = (
            r.name + " " +
            r.mobile + " " +
            (r.note || "")
        ).toLowerCase();

        if (search && !txt.includes(search)) return;

        let cls = "record";

        if (r.status !== "Paid") {
            if (r.date < today) cls += " overdue";
            else if (r.date === today) cls += " today";
        }

        html += `
        <div class="${cls}">
            <h3>${r.name}</h3>

            <p>📞 ${r.mobile}</p>
            <p>₹ ${r.amount}</p>
            <p>📅 ${r.date}</p>
            <p>📝 ${r.note || "-"}</p>
            <p>Status: ${r.status}</p>

            <div class="actions">

                ${
                    r.status !== "Paid"
                    ? `<button class="paid"
                       onclick="payNow(${r.row})">
                       Paid
                       </button>`
                    : `<button class="paid">
                       Done
                       </button>`
                }

                <button class="whatsapp"
                onclick="sendWA(
                '${r.mobile}',
                '${r.name}',
                '${r.amount}'
                )">
                WA
                </button>

                <button class="delete"
                onclick="removeRecord(${r.row})">
                Delete
                </button>

            </div>
        </div>`;
    });

    box.innerHTML =
        html ||
        `<div class="card empty">
        No reminders found
        </div>`;
}

/* ==========================================
   PAID
========================================== */
async function payNow(row) {
    const ok = await markPaidAPI(row);

    if (ok) {
        toast("Marked Paid");
        vibrate(40);
        await fullRefresh();
    } else {
        toast("Failed");
    }
}

/* ==========================================
   DELETE
========================================== */
async function removeRecord(row) {
    if (!confirm("Delete reminder?")) return;

    const ok = await deleteRecordAPI(row);

    if (ok) {
        toast("Deleted");
        vibrate(40);
        await fullRefresh();
    } else {
        toast("Delete Failed");
    }
}

/* ==========================================
   WHATSAPP
========================================== */
function sendWA(mobile, name, amount) {
    const msg =
`Hello ${name},

Your payment of ₹${amount} is pending.

Please pay soon.

Khanta Enterprises`;

    const url =
        "https://wa.me/91" +
        mobile +
        "?text=" +
        encodeURIComponent(msg);

    window.open(url, "_blank");
}

/* ==========================================
   TOAST
========================================== */
function toast(msg) {
    let t = document.querySelector(".toast");

    if (!t) {
        t = document.createElement("div");
        t.className = "toast";
        document.body.appendChild(t);
    }

    t.innerText = msg;
    t.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        t.classList.remove("show");
    }, 2200);
}

/* ==========================================
   NETWORK STATUS
========================================== */
function initNetworkBar() {
    window.addEventListener("online", () => showNet("Back Online", true));
    window.addEventListener("offline", () => showNet("No Internet", false));
}

function showNet(msg, online) {
    let bar = document.querySelector(".netbar");

    if (!bar) {
        bar = document.createElement("div");
        bar.className = "netbar";
        document.body.appendChild(bar);
    }

    bar.innerText = msg;
    bar.className = "netbar show " + (online ? "online" : "offline");

    clearTimeout(window.netTimer);

    window.netTimer = setTimeout(() => {
        bar.classList.remove("show");
    }, 2200);
}

/* ==========================================
   HELPERS
========================================== */
function byId(id) {
    return document.getElementById(id);
}

function val(id) {
    return byId(id).value.trim();
}

function text(id, v) {
    if (byId(id)) byId(id).innerText = v;
}

function isoToday() {
    return new Date().toISOString().split("T")[0];
}

function setYear() {
    if (byId("year")) {
        byId("year").textContent =
            new Date().getFullYear();
    }
}

function clearForm() {
    ["name", "mobile", "amount", "date", "note"]
    .forEach(id => {
        if (byId(id)) byId(id).value = "";
    });
}

function showLoader() {
    const box = byId("records");

    if (box) {
        box.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>`;
    }
}

function renderError() {
    const box = byId("records");

    if (box) {
        box.innerHTML = `
        <div class="card empty">
        Unable to connect backend
        </div>`;
    }
}

function debounce(fn, delay) {
    let t;

    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function vibrate(ms = 30) {
    if (navigator.vibrate) {
        navigator.vibrate(ms);
    }
}

/* ==========================================
   GLOBAL (for inline buttons)
========================================== */
window.payNow = payNow;
window.removeRecord = removeRecord;
window.sendWA = sendWA;
