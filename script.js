const sheetURL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

async function addRecord() {
    const name = document.getElementById("name").value;
    const mobile = document.getElementById("mobile").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    if (!name || !mobile || !amount || !date) {
        alert("Fill all fields");
        return;
    }

    await fetch(sheetURL, {
        method: "POST",
        body: JSON.stringify({
            action: "add",
            name,
            mobile,
            amount,
            date
        })
    });

    alert("Record Added");

    document.getElementById("name").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";

    loadData();
}

async function loadData() {
    const search = document.getElementById("search").value.toLowerCase();

    const res = await fetch(sheetURL);
    const data = await res.json();

    let html = "";

    data.reverse().forEach((row, index) => {
        if (!row.name.toLowerCase().includes(search)) return;

        let cls = "record";

        const today = new Date().toISOString().split("T")[0];

        if (row.date < today && row.status !== "Paid") cls += " overdue";
        else if (row.date === today && row.status !== "Paid") cls += " today";

        html += `
        <div class="${cls}">
            <h3>${row.name}</h3>
            <p>📞 ${row.mobile}</p>
            <p>₹ ${row.amount}</p>
            <p>📅 ${row.date}</p>
            <p>Status: ${row.status}</p>
            ${
              row.status !== "Paid"
                ? `<button class="paid" onclick="markPaid(${row.row})">Mark Paid</button>`
                : ""
            }
        </div>`;
    });

    document.getElementById("records").innerHTML = html;
}

async function markPaid(row) {
    await fetch(sheetURL, {
        method: "POST",
        body: JSON.stringify({
            action: "paid",
            row
        })
    });

    loadData();
}

loadData();
