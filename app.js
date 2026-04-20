/* ==========================================
   app.js
   Frontend UI Controller Only
   Khanta Payment Reminder
========================================== */

/* Pages */
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

/* Init */
document.addEventListener("DOMContentLoaded", () => {
    showPage("home");
    refreshDashboard();
});


/* ==========================================
   PAGE NAVIGATION
========================================== */
function showPage(pageId){

    pages.forEach(page=>{
        page.classList.remove("active");
    });

    const target =
    document.getElementById(pageId);

    if(target){
        target.classList.add("active");
    }

    navButtons.forEach(btn=>{
        btn.classList.remove("active-btn");
    });

    const activeBtn =
    document.getElementById(pageId + "Btn");

    if(activeBtn){
        activeBtn.classList.add("active-btn");
    }

    if(pageId === "home" || pageId === "list"){
        refreshDashboard();
    }
}


/* ==========================================
   SAVE BUTTON CLICK
========================================== */
async function saveReminder(){

    const name =
    document.getElementById("name").value.trim();

    const mobile =
    document.getElementById("mobile").value.trim();

    const amount =
    document.getElementById("amount").value.trim();

    const date =
    document.getElementById("date").value;

    const note =
    document.getElementById("note").value.trim();

    if(!name || !mobile || !amount || !date){
        alert("Please fill all fields.");
        return;
    }

    if(mobile.length < 10 || isNaN(mobile)){
        alert("Enter valid mobile number.");
        return;
    }

    const btn =
    document.getElementById("saveBtn");

    btn.innerText = "Saving...";
    btn.disabled = true;

    const ok = await addRecordAPI({
        name,
        mobile,
        amount,
        date,
        note
    });

    btn.innerText = "Save Reminder";
    btn.disabled = false;

    if(ok){

        clearForm();

        alert("Reminder Saved");

        showPage("home");

    }else{
        alert("Save Failed");
    }
}


/* ==========================================
   LOAD ALL UI DATA
========================================== */
async function refreshDashboard(){

    showLoader();

    const data = await getRecordsAPI();

    hideLoader();

    if(!data){
        renderError();
        return;
    }

    renderDashboard(data);
    renderRecords(data);
}


/* ==========================================
   DASHBOARD
========================================== */
function renderDashboard(data){

    const today =
    new Date().toISOString().split("T")[0];

    let total = data.length;
    let pending = 0;
    let dueToday = 0;
    let paid = 0;

    data.forEach(row=>{

        if(row.status !== "Paid"){
            pending += Number(row.amount);
        }

        if(row.status === "Paid"){
            paid++;
        }

        if(
          row.date === today &&
          row.status !== "Paid"
        ){
            dueToday++;
        }

    });

    document.getElementById(
    "totalCustomers").innerText = total;

    document.getElementById(
    "pendingAmount").innerText =
    "₹" + pending;

    document.getElementById(
    "dueToday").innerText =
    dueToday;

    document.getElementById(
    "paidCount").innerText =
    paid;
}


/* ==========================================
   RECORD LIST
========================================== */
function renderRecords(data){

    const box =
    document.getElementById("records");

    if(!box) return;

    const search =
    document.getElementById("search")
    ? document.getElementById("search")
      .value.toLowerCase()
    : "";

    const today =
    new Date().toISOString()
    .split("T")[0];

    let html = "";

    data.reverse().forEach(row=>{

        const text =
        (
         row.name + " " +
         row.mobile + " " +
         row.note
        ).toLowerCase();

        if(search &&
          !text.includes(search)){
            return;
        }

        let cls = "record";

        if(
          row.date < today &&
          row.status !== "Paid"
        ){
            cls += " overdue";
        }
        else if(
          row.date === today &&
          row.status !== "Paid"
        ){
            cls += " today";
        }

        html += `
        <div class="${cls}">

            <h3>${row.name}</h3>

            <p>📞 ${row.mobile}</p>
            <p>₹ ${row.amount}</p>
            <p>📅 ${row.date}</p>
            <p>📝 ${row.note || "-"}</p>
            <p>Status: ${row.status}</p>

            <div class="actions">

                ${
                row.status !== "Paid"
                ?
                `<button class="paid"
                 onclick="payNow(${row.row})">
                 Paid
                 </button>`
                :
                `<button class="paid">
                 Done
                 </button>`
                }

                <button class="whatsapp"
                onclick="sendWA(
                '${row.mobile}',
                '${row.name}',
                '${row.amount}'
                )">
                WA
                </button>

                <button class="delete"
                onclick="removeRecord(
                ${row.row}
                )">
                Delete
                </button>

            </div>

        </div>
        `;
    });

    if(html === ""){
        html =
        `<div class="card empty">
        No reminders found.
        </div>`;
    }

    box.innerHTML = html;
}


/* ==========================================
   MARK PAID
========================================== */
async function payNow(row){

    await markPaidAPI(row);

    refreshDashboard();
}


/* ==========================================
   DELETE
========================================== */
async function removeRecord(row){

    const ok =
    confirm("Delete reminder?");

    if(!ok) return;

    await deleteRecordAPI(row);

    refreshDashboard();
}


/* ==========================================
   WHATSAPP
========================================== */
function sendWA(
mobile,name,amount
){

const msg =
`Hello ${name},

Your payment of ₹${amount} is pending.

Please pay soon.

Khanta Enterprises`;

window.open(
"https://wa.me/91" +
mobile +
"?text=" +
encodeURIComponent(msg),
"_blank"
);

}


/* ==========================================
   HELPERS
========================================== */
function clearForm(){

document.getElementById("name").value="";
document.getElementById("mobile").value="";
document.getElementById("amount").value="";
document.getElementById("date").value="";
document.getElementById("note").value="";

}

function showLoader(){

const box =
document.getElementById("records");

if(box){
box.innerHTML =
`<div class="card empty">
Loading...
</div>`;
}

}

function hideLoader(){}

function renderError(){

const box =
document.getElementById("records");

if(box){
box.innerHTML =
`<div class="card empty">
Unable to connect backend.
</div>`;
}

}        const today =
        new Date().toISOString().split("T")[0];

        const search =
        document.getElementById("search")
        ? document.getElementById("search").value.toLowerCase()
        : "";

        let html = "";

        let totalCustomers = 0;
        let pendingAmount = 0;
        let dueToday = 0;
        let paidCount = 0;

        data.reverse().forEach(row=>{

            totalCustomers++;

            if(row.status !== "Paid"){
                pendingAmount += Number(row.amount);
            }

            if(row.status === "Paid"){
                paidCount++;
            }

            if(row.date === today &&
               row.status !== "Paid"){
                dueToday++;
            }

            const searchText =
            (row.name + " " +
             row.mobile + " " +
             row.note).toLowerCase();

            if(search &&
              !searchText.includes(search)){
                return;
            }

            let cls = "record";

            if(row.date < today &&
               row.status !== "Paid"){
                cls += " overdue";
            }
            else if(row.date === today &&
                    row.status !== "Paid"){
                cls += " today";
            }

            html += `
            <div class="${cls}">
                <h3>${row.name}</h3>

                <p>📞 ${row.mobile}</p>
                <p>₹ ${row.amount}</p>
                <p>📅 ${row.date}</p>
                <p>📝 ${row.note || "-"}</p>
                <p>Status: ${row.status}</p>

                <div class="actions">

                    ${
                        row.status !== "Paid"
                        ? `<button class="paid"
                           onclick="markPaid(${row.row})">
                           Paid
                           </button>`

                        : `<button class="paid">
                           Done
                           </button>`
                    }

                    <button class="whatsapp"
                    onclick="sendWhatsApp(
                    '${row.mobile}',
                    '${row.name}',
                    '${row.amount}'
                    )">
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

        if(html === ""){
            html =
            `<div class="card empty">
            No reminders found.
            </div>`;
        }

        document.getElementById("records")
        .innerHTML = html;

        document.getElementById("totalCustomers")
        .innerText = totalCustomers;

        document.getElementById("pendingAmount")
        .innerText = "₹" + pendingAmount;

        document.getElementById("dueToday")
        .innerText = dueToday;

        document.getElementById("paidCount")
        .innerText = paidCount;

    }catch(error){

        console.log(error);

        document.getElementById("records")
        .innerHTML =
        `<div class="card empty">
        Unable to load data.
        </div>`;
    }
}


/* ==================================
   MARK AS PAID
================================== */
async function markPaid(row){

    const form = new URLSearchParams();
    form.append("action","paid");
    form.append("row",row);

    await fetch(sheetURL,{
        method:"POST",
        body:form
    });

    loadData();
}


/* ==================================
   DELETE RECORD
================================== */
async function deleteRecord(row){

    if(!confirm("Delete this reminder?")){
        return;
    }

    const form = new URLSearchParams();
    form.append("action","delete");
    form.append("row",row);

    await fetch(sheetURL,{
        method:"POST",
        body:form
    });

    loadData();
}


/* ==================================
   WHATSAPP MESSAGE
================================== */
function sendWhatsApp(
mobile,name,amount){

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

    window.open(url,"_blank");
}


/* ==================================
   AUTO START
================================== */
loadData();        const search = searchBox
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

/* ==========================================
   GLOBAL ACCESS FOR HTML BUTTONS
========================================== */

window.showPage = showPage;
window.saveReminder = saveReminder;
window.refreshDashboard = refreshDashboard;
window.payNow = payNow;
window.removeRecord = removeRecord;
window.sendWA = sendWA;
/* ===============================
   START APP
   =============================== */
loadData();
