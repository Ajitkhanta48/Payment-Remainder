/* ==========================================
   Khanta Payment Reminder
   ANDROID COMPATIBLE FINAL app.js
   (No optional chaining / old browser safe)
========================================== */

/* ---------- STATE ---------- */
var appData = [];
var isLoading = false;
var lastFetch = 0;
var CACHE_MS = 30000;
var getRecordsAPI = typeof window.getRecordsAPI === "function" ? window.getRecordsAPI : null;
var addRecordAPI = typeof window.addRecordAPI === "function" ? window.addRecordAPI : null;
var markPaidAPI = typeof window.markPaidAPI === "function" ? window.markPaidAPI : null;
var deleteRecordAPI = typeof window.deleteRecordAPI === "function" ? window.deleteRecordAPI : null;

function apiFn(name) {
    if (typeof window[name] === "function") {
        return window[name];
    }
    if (name === "getRecordsAPI") return getRecordsAPI;
    if (name === "addRecordAPI") return addRecordAPI;
    if (name === "markPaidAPI") return markPaidAPI;
    if (name === "deleteRecordAPI") return deleteRecordAPI;
    return null;
}

function installFallbackAPI() {
    var FALLBACK_API_URL =
    "https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";

    function parseJSON(text, fallback) {
        if (!text) return fallback;
        try {
            return JSON.parse(text);
        } catch (e) {
            return fallback;
        }
    }

    function fetchList() {
        return fetch(
            FALLBACK_API_URL + "?t=" + new Date().getTime(),
            { method: "GET", cache: "no-store", redirect: "follow" }
        )
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.text();
            })
            .then(function (txt) {
                return parseJSON(txt, []);
            })
            .catch(function () {
                return [];
            });
    }

    function actionCall(action, params) {
        var pairs = [];
        var k;

        pairs.push("action=" + encodeURIComponent(action));
        for (k in params) {
            if (Object.prototype.hasOwnProperty.call(params, k)) {
                pairs.push(
                    encodeURIComponent(k) + "=" +
                    encodeURIComponent(params[k] == null ? "" : String(params[k]))
                );
            }
        }
        pairs.push("t=" + encodeURIComponent(String(new Date().getTime())));

        return fetch(
            FALLBACK_API_URL + "?" + pairs.join("&"),
            { method: "GET", cache: "no-store", redirect: "follow" }
        )
            .then(function (res) {
                return !!res.ok;
            })
            .catch(function () {
                return false;
            });
    }

    if (typeof window.getRecordsAPI !== "function") {
        window.getRecordsAPI = fetchList;
    }

    if (typeof window.addRecordAPI !== "function") {
        window.addRecordAPI = function (data) {
            return actionCall("add", {
                name: data && data.name,
                mobile: data && data.mobile,
                amount: data && data.amount,
                date: data && data.date,
                note: data && data.note
            });
        };
    }

    if (typeof window.markPaidAPI !== "function") {
        window.markPaidAPI = function (row) {
            return actionCall("paid", { row: row });
        };
    }

    if (typeof window.deleteRecordAPI !== "function") {
        window.deleteRecordAPI = function (row) {
            return actionCall("delete", { row: row });
        };
    }
}

/* ==========================================
   START
========================================== */
document.addEventListener("DOMContentLoaded", function () {
    installFallbackAPI();
    setupEvents();
    setYear();
    initNetworkBar();
    showPage("home");
});

/* ==========================================
   EVENTS
========================================== */
function setupEvents() {

    var homeBtn = byId("homeBtn");
    if (homeBtn) {
        homeBtn.addEventListener("click", function () {
            showPage("home");
        });
    }

    var addBtn = byId("addBtn");
    if (addBtn) {
        addBtn.addEventListener("click", function () {
            showPage("add");
        });
    }

    var listBtn = byId("listBtn");
    if (listBtn) {
        listBtn.addEventListener("click", function () {
            showPage("list");
        });
    }

    var saveBtn = byId("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveReminder);
    }

    var search = byId("search");
    if (search) {
        search.addEventListener("input", debounce(function () {
            renderRecords(appData);
        }, 220));
    }
}

/* ==========================================
   PAGE NAVIGATION
========================================== */
function showPage(pageId) {

    var pages = document.querySelectorAll(".page");
    var i;

    for (i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active");
    }

    var page = byId(pageId);
    if (page) {
        page.classList.add("active");
    }

    var navs = document.querySelectorAll(".nav-btn");
    for (i = 0; i < navs.length; i++) {
        navs[i].classList.remove("active-btn");
    }

    var btn = byId(pageId + "Btn");
    if (btn) {
        btn.classList.add("active-btn");
    }

    if (pageId === "home" || pageId === "list") {
        loadDataSmart();
    }
}

/* ==========================================
   SMART LOAD
========================================== */
function loadDataSmart() {

    var now = new Date().getTime();

    if (appData.length > 0 &&
        (now - lastFetch) < CACHE_MS) {

        renderDashboard(appData);
        renderRecords(appData);
        backgroundRefresh();
        return;
    }

    fullRefresh();
}

function fullRefresh() {

    if (isLoading) return;

    isLoading = true;

    if (appData.length === 0) {
        showLoader();
    }

    var getRecords = apiFn("getRecordsAPI");
    if (!getRecords) {
        isLoading = false;
        renderError();
        return;
    }

    getRecords().then(function (data) {

        isLoading = false;

        if (!data) {
            if (appData.length === 0) {
                renderError();
            }
            return;
        }

        appData = data;
        lastFetch = new Date().getTime();

        renderDashboard(appData);
        renderRecords(appData);

    });
}

function backgroundRefresh() {

    if (isLoading) return;

    isLoading = true;

    var getRecords = apiFn("getRecordsAPI");
    if (!getRecords) {
        isLoading = false;
        return;
    }

    getRecords().then(function (data) {

        isLoading = false;

        if (!data) return;

        appData = data;
        lastFetch = new Date().getTime();

        renderDashboard(appData);
        renderRecords(appData);

    });
}

/* ==========================================
   SAVE
========================================== */
function saveReminder() {

    var payload = {
        name: val("name"),
        mobile: val("mobile"),
        amount: val("amount"),
        date: byId("date").value,
        note: val("note")
    };

    if (!payload.name ||
        !payload.mobile ||
        !payload.amount ||
        !payload.date) {

        toast("Please fill all fields");
        return;
    }

    if (payload.mobile.length < 10 ||
        isNaN(payload.mobile)) {

        toast("Enter valid mobile");
        return;
    }

    var btn = byId("saveBtn");
    btn.disabled = true;
    btn.innerHTML = "Saving...";

    var addRecord = apiFn("addRecordAPI");
    if (!addRecord) {
        btn.disabled = false;
        btn.innerHTML = "💾 Save Reminder";
        toast("API Not Loaded");
        return;
    }

    addRecord(payload).then(function (ok) {

        btn.disabled = false;
        btn.innerHTML = "💾 Save Reminder";

        if (!ok) {
            toast("Save Failed");
            return;
        }

        clearForm();
        toast("Saved Successfully");
        vibrate(50);

        fullRefresh();
        showPage("home");
    });
}

/* ==========================================
   DASHBOARD
========================================== */
function renderDashboard(data) {

    var today = isoToday();

    var total = data.length;
    var pending = 0;
    var due = 0;
    var paid = 0;

    var i, r;

    for (i = 0; i < data.length; i++) {

        r = data[i];

        if (r.status !== "Paid") {
            pending += Number(r.amount);
        }

        if (r.status === "Paid") {
            paid++;
        }

        if (r.date === today &&
            r.status !== "Paid") {
            due++;
        }
    }

    text("totalCustomers", total);
    text("pendingAmount", "₹" + pending);
    text("dueToday", due);
    text("paidCount", paid);
}

/* ==========================================
   RECORDS
========================================== */
function renderRecords(data) {

    var box = byId("records");
    if (!box) return;

    var search = "";
    if (byId("search")) {
        search = byId("search").value.toLowerCase();
    }

    var today = isoToday();
    var html = "";

    var arr = data.slice().reverse();

    var i, r, cls, txt;

    for (i = 0; i < arr.length; i++) {

        r = arr[i];

        txt = (
            r.name + " " +
            r.mobile + " " +
            (r.note || "")
        ).toLowerCase();

        if (search &&
            txt.indexOf(search) === -1) {
            continue;
        }

        cls = "record";

        if (r.status !== "Paid") {

            if (r.date < today) {
                cls += " overdue";
            } else if (r.date === today) {
                cls += " today";
            }
        }

        html +=
        '<div class="' + cls + '">' +
        '<h3>' + r.name + '</h3>' +
        '<p>📞 ' + r.mobile + '</p>' +
        '<p>₹ ' + r.amount + '</p>' +
        '<p>📅 ' + r.date + '</p>' +
        '<p>📝 ' + (r.note || "-") + '</p>' +
        '<p>Status: ' + r.status + '</p>' +

        '<div class="actions">';

        if (r.status !== "Paid") {
            html +=
            '<button class="paid" onclick="payNow(' + r.row + ')">Paid</button>';
        } else {
            html +=
            '<button class="paid">Done</button>';
        }

        html +=
        '<button class="whatsapp" onclick="sendWA(\'' +
        r.mobile + '\',\'' +
        safeText(r.name) + '\',\'' +
        r.amount + '\')">WA</button>' +

        '<button class="delete" onclick="removeRecord(' +
        r.row + ')">Delete</button>' +

        '</div></div>';
    }

    if (html === "") {
        html =
        '<div class="card empty">No reminders found</div>';
    }

    box.innerHTML = html;
}

/* ==========================================
   PAID
========================================== */
function payNow(row) {

    var markPaid = apiFn("markPaidAPI");
    if (!markPaid) {
        toast("API Not Loaded");
        return;
    }

    markPaid(row).then(function (ok) {

        if (ok) {
            toast("Marked Paid");
            vibrate(40);
            fullRefresh();
        } else {
            toast("Failed");
        }

    });
}

/* ==========================================
   DELETE
========================================== */
function removeRecord(row) {

    if (!confirm("Delete reminder?")) return;

    var deleteRecord = apiFn("deleteRecordAPI");
    if (!deleteRecord) {
        toast("API Not Loaded");
        return;
    }

    deleteRecord(row).then(function (ok) {

        if (ok) {
            toast("Deleted");
            vibrate(40);
            fullRefresh();
        } else {
            toast("Delete Failed");
        }

    });
}

/* ==========================================
   WHATSAPP
========================================== */
function sendWA(mobile, name, amount) {

    var msg =
"Hello " + name + ",\n\n" +
"Your payment of ₹" + amount + " is pending.\n\n" +
"Please pay soon.\n\n" +
"Khanta Enterprises";

    var url =
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

    var t =
    document.querySelector(".toast");

    if (!t) {
        t = document.createElement("div");
        t.className = "toast";
        document.body.appendChild(t);
    }

    t.innerHTML = msg;
    t.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
    setTimeout(function () {
        t.classList.remove("show");
    }, 2200);
}

/* ==========================================
   NETWORK
========================================== */
function initNetworkBar() {

    window.addEventListener("online", function () {
        showNet("Back Online", true);
    });

    window.addEventListener("offline", function () {
        showNet("No Internet", false);
    });
}

function showNet(msg, online) {

    var bar =
    document.querySelector(".netbar");

    if (!bar) {
        bar = document.createElement("div");
        bar.className = "netbar";
        document.body.appendChild(bar);
    }

    bar.innerHTML = msg;
    bar.className =
    "netbar show " +
    (online ? "online" : "offline");

    clearTimeout(window.netTimer);

    window.netTimer =
    setTimeout(function () {
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
    var el = byId(id);
    return el ? el.value.replace(/^\s+|\s+$/g, "") : "";
}

function text(id, v) {
    var el = byId(id);
    if (el) el.innerHTML = v;
}

function isoToday() {
    return new Date().toISOString().split("T")[0];
}

function setYear() {
    var y = byId("year");
    if (y) {
        y.innerHTML =
        new Date().getFullYear();
    }
}

function clearForm() {

    var ids =
    ["name","mobile","amount","date","note"];

    var i, el;

    for (i = 0; i < ids.length; i++) {
        el = byId(ids[i]);
        if (el) el.value = "";
    }
}

function showLoader() {

    var box = byId("records");

    if (box) {
        box.innerHTML =
        '<div class="skeleton"></div>' +
        '<div class="skeleton"></div>' +
        '<div class="skeleton"></div>';
    }
}

function renderError() {

    var box = byId("records");

    if (box) {
        box.innerHTML =
        '<div class="card empty">' +
        'Unable to connect backend' +
        '</div>';
    }
}

function debounce(fn, delay) {

    var t;

    return function () {

        clearTimeout(t);

        t = setTimeout(fn, delay);
    };
}

function vibrate(ms) {
    if (navigator.vibrate) {
        navigator.vibrate(ms || 30);
    }
}

function safeText(str){
return String(str).replace(/'/g,"");
}

/* ==========================================
   GLOBAL
========================================== */
window.payNow = payNow;
window.removeRecord = removeRecord;
window.sendWA = sendWA;
window.showPage = showPage;
window.saveReminder = saveReminder;
    var now = new Date().getTime();

    if (appData.length > 0 &&
        (now - lastFetch) < CACHE_MS) {

        renderDashboard(appData);
        renderRecords(appData);
        backgroundRefresh();
        return;
    }

    fullRefresh();
}

function fullRefresh() {

    if (isLoading) return;

    isLoading = true;

    if (appData.length === 0) {
        showLoader();
    }

    var getRecords = apiFn("getRecordsAPI");
    if (!getRecords) {
        isLoading = false;
        renderError();
        return;
    }

    getRecords().then(function (data) {

        isLoading = false;

        if (!data) {
            if (appData.length === 0) {
                renderError();
            }
            return;
        }

        appData = data;
        lastFetch = new Date().getTime();

        renderDashboard(appData);
        renderRecords(appData);

    });
}

function backgroundRefresh() {

    if (isLoading) return;

    isLoading = true;

    var getRecords = apiFn("getRecordsAPI");
    if (!getRecords) {
        isLoading = false;
        return;
    }

    getRecords().then(function (data) {

        isLoading = false;

        if (!data) return;

        appData = data;
        lastFetch = new Date().getTime();

        renderDashboard(appData);
        renderRecords(appData);

    });
}

/* ==========================================
   SAVE
========================================== */
function saveReminder() {

    var payload = {
        name: val("name"),
        mobile: val("mobile"),
        amount: val("amount"),
        date: byId("date").value,
        note: val("note")
    };

    if (!payload.name ||
        !payload.mobile ||
        !payload.amount ||
        !payload.date) {

        toast("Please fill all fields");
        return;
    }

    if (payload.mobile.length < 10 ||
        isNaN(payload.mobile)) {

        toast("Enter valid mobile");
        return;
    }

    var btn = byId("saveBtn");
    btn.disabled = true;
    btn.innerHTML = "Saving...";

    var addRecord = apiFn("addRecordAPI");
    if (!addRecord) {
        btn.disabled = false;
        btn.innerHTML = "💾 Save Reminder";
        toast("API Not Loaded");
        return;
    }

    addRecord(payload).then(function (ok) {

        btn.disabled = false;
        btn.innerHTML = "💾 Save Reminder";

        if (!ok) {
            toast("Save Failed");
            return;
        }

        clearForm();
        toast("Saved Successfully");
        vibrate(50);

        fullRefresh();
        showPage("home");
    });
}

/* ==========================================
   DASHBOARD
========================================== */
function renderDashboard(data) {

    var today = isoToday();

    var total = data.length;
    var pending = 0;
    var due = 0;
    var paid = 0;

    var i, r;

    for (i = 0; i < data.length; i++) {

        r = data[i];

        if (r.status !== "Paid") {
            pending += Number(r.amount);
        }

        if (r.status === "Paid") {
            paid++;
        }

        if (r.date === today &&
            r.status !== "Paid") {
            due++;
        }
    }

    text("totalCustomers", total);
    text("pendingAmount", "₹" + pending);
    text("dueToday", due);
    text("paidCount", paid);
}

/* ==========================================
   RECORDS
========================================== */
function renderRecords(data) {

    var box = byId("records");
    if (!box) return;

    var search = "";
    if (byId("search")) {
        search = byId("search").value.toLowerCase();
    }

    var today = isoToday();
    var html = "";

    var arr = data.slice().reverse();

    var i, r, cls, txt;

    for (i = 0; i < arr.length; i++) {

        r = arr[i];

        txt = (
            r.name + " " +
            r.mobile + " " +
            (r.note || "")
        ).toLowerCase();

        if (search &&
            txt.indexOf(search) === -1) {
            continue;
        }

        cls = "record";

        if (r.status !== "Paid") {

            if (r.date < today) {
                cls += " overdue";
            } else if (r.date === today) {
                cls += " today";
            }
        }

        html +=
        '<div class="' + cls + '">' +
        '<h3>' + r.name + '</h3>' +
        '<p>📞 ' + r.mobile + '</p>' +
        '<p>₹ ' + r.amount + '</p>' +
        '<p>📅 ' + r.date + '</p>' +
        '<p>📝 ' + (r.note || "-") + '</p>' +
        '<p>Status: ' + r.status + '</p>' +

        '<div class="actions">';

        if (r.status !== "Paid") {
            html +=
            '<button class="paid" onclick="payNow(' + r.row + ')">Paid</button>';
        } else {
            html +=
            '<button class="paid">Done</button>';
        }

        html +=
        '<button class="whatsapp" onclick="sendWA(\'' +
        r.mobile + '\',\'' +
        safeText(r.name) + '\',\'' +
        r.amount + '\')">WA</button>' +

        '<button class="delete" onclick="removeRecord(' +
        r.row + ')">Delete</button>' +

        '</div></div>';
    }

    if (html === "") {
        html =
        '<div class="card empty">No reminders found</div>';
    }

    box.innerHTML = html;
}

/* ==========================================
   PAID
========================================== */
function payNow(row) {

    var markPaid = apiFn("markPaidAPI");
    if (!markPaid) {
        toast("API Not Loaded");
        return;
    }

    markPaid(row).then(function (ok) {

        if (ok) {
            toast("Marked Paid");
            vibrate(40);
            fullRefresh();
        } else {
            toast("Failed");
        }

    });
}

/* ==========================================
   DELETE
========================================== */
function removeRecord(row) {

    if (!confirm("Delete reminder?")) return;

    var deleteRecord = apiFn("deleteRecordAPI");
    if (!deleteRecord) {
        toast("API Not Loaded");
        return;
    }

    deleteRecord(row).then(function (ok) {

        if (ok) {
            toast("Deleted");
            vibrate(40);
            fullRefresh();
        } else {
            toast("Delete Failed");
        }

    });
}

/* ==========================================
   WHATSAPP
========================================== */
function sendWA(mobile, name, amount) {

    var msg =
"Hello " + name + ",\n\n" +
"Your payment of ₹" + amount + " is pending.\n\n" +
"Please pay soon.\n\n" +
"Khanta Enterprises";

    var url =
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

    var t =
    document.querySelector(".toast");

    if (!t) {
        t = document.createElement("div");
        t.className = "toast";
        document.body.appendChild(t);
    }

    t.innerHTML = msg;
    t.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
    setTimeout(function () {
        t.classList.remove("show");
    }, 2200);
}

/* ==========================================
   NETWORK
========================================== */
function initNetworkBar() {

    window.addEventListener("online", function () {
        showNet("Back Online", true);
    });

    window.addEventListener("offline", function () {
        showNet("No Internet", false);
    });
}

function showNet(msg, online) {

    var bar =
    document.querySelector(".netbar");

    if (!bar) {
        bar = document.createElement("div");
        bar.className = "netbar";
        document.body.appendChild(bar);
    }

    bar.innerHTML = msg;
    bar.className =
    "netbar show " +
    (online ? "online" : "offline");

    clearTimeout(window.netTimer);

    window.netTimer =
    setTimeout(function () {
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
    var el = byId(id);
    return el ? el.value.replace(/^\s+|\s+$/g, "") : "";
}

function text(id, v) {
    var el = byId(id);
    if (el) el.innerHTML = v;
}

function isoToday() {
    return new Date().toISOString().split("T")[0];
}

function setYear() {
    var y = byId("year");
    if (y) {
        y.innerHTML =
        new Date().getFullYear();
    }
}

function clearForm() {

    var ids =
    ["name","mobile","amount","date","note"];

    var i, el;

    for (i = 0; i < ids.length; i++) {
        el = byId(ids[i]);
        if (el) el.value = "";
    }
}

function showLoader() {

    var box = byId("records");

    if (box) {
        box.innerHTML =
        '<div class="skeleton"></div>' +
        '<div class="skeleton"></div>' +
        '<div class="skeleton"></div>';
    }
}

function renderError() {

    var box = byId("records");

    if (box) {
        box.innerHTML =
        '<div class="card empty">' +
        'Unable to connect backend' +
        '</div>';
    }
}

function debounce(fn, delay) {

    var t;

    return function () {

        clearTimeout(t);

        t = setTimeout(fn, delay);
    };
}

function vibrate(ms) {
    if (navigator.vibrate) {
        navigator.vibrate(ms || 30);
    }
}

function safeText(str){
return String(str).replace(/'/g,"");
}

/* ==========================================
   GLOBAL
========================================== */
window.payNow = payNow;
window.removeRecord = removeRecord;
window.sendWA = sendWA;
window.showPage = showPage;
window.saveReminder = saveReminder;
