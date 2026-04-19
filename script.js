const sheetURL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

/* ---------- Navigation ---------- */
function showPage(pageId){
    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    if(pageId === "list") loadData();
    if(pageId === "home") loadData();
}

/* ---------- Add Reminder ---------- */
async function addRecord(){

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();

    if(!name || !mobile || !amount || !date){
        alert("Fill all required fields");
        return;
    }

    await fetch(sheetURL,{
        method:"POST",
        body:JSON.stringify({
            action:"add",
            name:name,
            mobile:mobile,
            amount:amount,
            date:date,
            note:note
        })
    });

    alert("Reminder Saved");

    document.getElementById("name").value="";
    document.getElementById("mobile").value="";
    document.getElementById("amount").value="";
    document.getElementById("date").value="";
    document.getElementById("note").value="";

    showPage("home");
    loadData();
}

/* ---------- Load Records ---------- */
async function loadData(){

    const res = await fetch(sheetURL);
    const data = await res.json();

    const searchBox = document.getElementById("search");
    const search = searchBox ? searchBox.value.toLowerCase() : "";

    let html = "";

    let totalCustomers = 0;
    let pendingAmount = 0;
    let dueToday = 0;
    let paidCount = 0;

    const today = new Date().toISOString().split("T")[0];

    data.reverse().forEach(row => {

        totalCustomers++;

        if(row.status !== "Paid"){
            pendingAmount += Number(row.amount);
        }

        if(row.date === today && row.status !== "Paid"){
            dueToday++;
        }

        if(row.status === "Paid"){
            paidCount++;
        }

        if(search && !row.name.toLowerCase().includes(search)){
            return;
        }

        let cls = "record";

        if(row.date < today && row.status !== "Paid"){
            cls += " overdue";
        }else if(row.date === today && row.status !== "Paid"){
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
        </div>`;
    });

    const records = document.getElementById("records");
    if(records) records.innerHTML = html;

    document.getElementById("totalCustomers").innerText = totalCustomers;
    document.getElementById("pendingAmount").innerText = "₹" + pendingAmount;
    document.getElementById("dueToday").innerText = dueToday;
    document.getElementById("paidCount").innerText = paidCount;
}

/* ---------- Mark Paid ---------- */
async function markPaid(row){

    await fetch(sheetURL,{
        method:"POST",
        body:JSON.stringify({
            action:"paid",
            row:row
        })
    });

    loadData();
}

/* ---------- Delete ---------- */
async function deleteRecord(row){

    if(!confirm("Delete this record?")) return;

    await fetch(sheetURL,{
        method:"POST",
        body:JSON.stringify({
            action:"delete",
            row:row
        })
    });

    loadData();
}

/* ---------- WhatsApp ---------- */
function sendWhatsApp(mobile,name,amount){

    const msg =
`Hello ${name},
Your payment of ₹${amount} is pending.
Please pay soon.
Khanta Enterprises`;

    const url =
"https://wa.me/91" + mobile + "?text=" + encodeURIComponent(msg);

    window.open(url,"_blank");
}

/* ---------- Start ---------- */
loadData();
