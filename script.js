/* ===============================
   Khanta Payment Reminder System
   Fully Regenerated script.js
   =============================== */

/* 🔴 IMPORTANT:
   Replace below URL with your Google Apps Script /exec URL
*/
const sheetURL =
"https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";


/* ===============================
   PAGE NAVIGATION
   =============================== */
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    if (pageId === "home" || pageId === "list") {
        loadData();
    }
}


/* ===============================
   SAVE REMINDER
   =============================== */
async function addRecord() {

    const name   = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const date   = document.getElementById("date").value;
    const note   = document.getElementById("note").value.trim();

    /* Validation */
    if (!name || !mobile || !amount || !date) {
        alert("Please fill all required fields.");
        return;
    }

    if (mobile.length < 10) {
        alert("Enter valid mobile number.");
        return;
    }

    const form = new URLSearchParams();
    form.append("action", "add");
    form.append("name", name);
    form.append("mobile", mobile);
    form.append("amount", amount);
    form.append("date", date);
    form.append("note", note);

    try {

        const btn = document.querySelector("#add button");
        btn.innerText = "Saving...";
        btn.disabled = true;

        await fetch(sheetURL, {
            method: "POST",
            body: form
        });

        alert("Reminder Saved Successfully");

        /* Clear fields */
        document.getElementById("name").value = "";
        document.getElementById("mobile").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("date").value = "";
        document.getElementById("note").value = "";

        showPage("home");
        loadData();

    } catch (error) {
        alert("Save Failed. Check Script URL.");
        console.log(error);
    }

    const btn = document.querySelector("#add button");
    btn.innerText = "Save Reminder";
    btn.disabled = false;
}


/* ===============================
   LOAD DATA
   =============================== */
async function loadData() {

    try {

        const res = await fetch(sheetURL);
        const data = await res.json();

        let html = "";

        let totalCustomers = 0;
        let pendingAmount = 0;
        let dueToday = 0;
        let paidCount = 0;

        const today = new Date().toISOString().split("T")[0];

        const searchBox = document.getElementById("search");
        const search = searchBox
            ? searchBox.value.toLowerCase()
            : "";

        data.reverse().forEach(row => {

            totalCustomers++;

            if (row.status !== "Paid") {
                pendingAmount += Number(row.amount);
            }

            if (row.status === "Paid") {
                paidCount++;
            }

            if (row.date === today && row.status !== "Paid") {
                dueToday++;
            }

            if (search && !row.name.toLowerCase().includes(search)) {
                return;
            }

            let cls = "record";

            if (row.date < today && row.status !== "Paid") {
                cls += " overdue";
            }
            else if (row.date === today && row.status !== "Paid") {
                cls += " today";
            }

            html += `
            <div class="${cls}">
                <h3>${row.name}</h3>
                <p>📞 ${row.mobile}</p>
                <p>₹ ${row.amount}</p>
                <p>📅 ${row.date}</p>
                <p>📝 ${row.note || ""}</p>
                <p>Status: ${row.status}</p>

                <div class="actions">

                    ${
                        row.status !== "Paid"
                        ? `<button class="paid" onclick="markPaid(${row.row})">Paid</button>`
                        : `<button class="paid">Done</button>`
                    }

                    <button class="whatsapp"
                    onclick="sendWhatsApp('${row.mobile}','${row.name}','${row.amount}')">
                    WA
                    </button>

                    <button class="delete"
                    onclick="deleteRecord(${row.row})">
                    Delete
                    </button>

                </div>
            </div>
            `;
        });

        document.getElementById("records").innerHTML = html;

        document.getElementById("totalCustomers").innerText = totalCustomers;
        document.getElementById("pendingAmount").innerText = "₹" + pendingAmount;
        document.getElementById("dueToday").innerText = dueToday;
        document.getElementById("paidCount").innerText = paidCount;

    } catch (error) {
        console.log(error);
    }
}


/* ===============================
   MARK PAID
   =============================== */
async function markPaid(row) {

    const form = new URLSearchParams();
    form.append("action", "paid");
    form.append("row", row);

    await fetch(sheetURL, {
        method: "POST",
        body: form
    });

    loadData();
}


/* ===============================
   DELETE RECORD
   =============================== */
async function deleteRecord(row) {

    if (!confirm("Delete this reminder?")) return;

    const form = new URLSearchParams();
    form.append("action", "delete");
    form.append("row", row);

    await fetch(sheetURL, {
        method: "POST",
        body: form
    });

    loadData();
}


/* ===============================
   WHATSAPP REMINDER
   =============================== */
function sendWhatsApp(mobile, name, amount) {

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


/* ===============================
   START APP
   =============================== */
loadData();
