/* ==========================================
   app.js
   FINAL FIXED VERSION
   Frontend Controller Only
========================================== */


/* ==========================================
   DOM READY
========================================== */
document.addEventListener("DOMContentLoaded", () => {

    showPage("home");

});


/* ==========================================
   PAGE NAVIGATION
========================================== */
function showPage(pageId){

    document.querySelectorAll(".page")
    .forEach(page=>{
        page.classList.remove("active");
    });

    const target =
    document.getElementById(pageId);

    if(target){
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-btn")
    .forEach(btn=>{
        btn.classList.remove("active-btn");
    });

    const activeBtn =
    document.getElementById(pageId + "Btn");

    if(activeBtn){
        activeBtn.classList.add("active-btn");
    }

    if(pageId === "home" ||
       pageId === "list"){
        refreshDashboard();
    }
}


/* ==========================================
   SAVE REMINDER
========================================== */
async function saveReminder(){

    const name =
    document.getElementById("name")
    .value.trim();

    const mobile =
    document.getElementById("mobile")
    .value.trim();

    const amount =
    document.getElementById("amount")
    .value.trim();

    const date =
    document.getElementById("date")
    .value;

    const note =
    document.getElementById("note")
    .value.trim();

    if(!name || !mobile ||
       !amount || !date){

        alert("Please fill all fields.");
        return;
    }

    if(mobile.length < 10 ||
       isNaN(mobile)){

        alert("Enter valid mobile.");
        return;
    }

    const btn =
    document.getElementById("saveBtn");

    btn.innerText = "Saving...";
    btn.disabled = true;

    const ok =
    await addRecordAPI({
        name,
        mobile,
        amount,
        date,
        note
    });

    btn.innerText =
    "Save Reminder";

    btn.disabled = false;

    if(ok){

        clearForm();

        alert("Saved Successfully");

        showPage("home");

    }else{

        alert("Save Failed");
    }
}


/* ==========================================
   LOAD DATA
========================================== */
async function refreshDashboard(){

    showLoader();

    const data =
    await getRecordsAPI();

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
    new Date()
    .toISOString()
    .split("T")[0];

    let total = data.length;
    let pending = 0;
    let due = 0;
    let paid = 0;

    data.forEach(row=>{

        if(row.status !== "Paid"){
            pending +=
            Number(row.amount);
        }

        if(row.status === "Paid"){
            paid++;
        }

        if(
          row.date === today &&
          row.status !== "Paid"
        ){
            due++;
        }

    });

    document.getElementById(
    "totalCustomers")
    .innerText = total;

    document.getElementById(
    "pendingAmount")
    .innerText =
    "₹" + pending;

    document.getElementById(
    "dueToday")
    .innerText = due;

    document.getElementById(
    "paidCount")
    .innerText = paid;
}


/* ==========================================
   RECORD LIST
========================================== */
function renderRecords(data){

    const box =
    document.getElementById(
    "records"
    );

    if(!box) return;

    const searchInput =
    document.getElementById(
    "search"
    );

    const search =
    searchInput
    ? searchInput.value
      .toLowerCase()
    : "";

    const today =
    new Date()
    .toISOString()
    .split("T")[0];

    let html = "";

    data.reverse()
    .forEach(row=>{

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
   PAID
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

Your payment of ₹${amount}
is pending.

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

document.getElementById(
"name").value = "";

document.getElementById(
"mobile").value = "";

document.getElementById(
"amount").value = "";

document.getElementById(
"date").value = "";

document.getElementById(
"note").value = "";

}


function showLoader(){

const box =
document.getElementById(
"records"
);

if(box){
box.innerHTML =
`<div class="card empty">
Loading...
</div>`;
}

}


function renderError(){

const box =
document.getElementById(
"records"
);

if(box){
box.innerHTML =
`<div class="card empty">
Unable to connect backend.
</div>`;
}

}


/* ==========================================
   GLOBAL FUNCTIONS
========================================== */
window.showPage = showPage;
window.saveReminder = saveReminder;
window.refreshDashboard =
refreshDashboard;

window.payNow = payNow;
window.removeRecord =
removeRecord;

window.sendWA = sendWA;
