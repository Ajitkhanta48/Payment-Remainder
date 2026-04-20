/* ==========================================
   api.js
   Backend Connector Only
   Khanta Payment Reminder
========================================== */

/* Google Apps Script Backend URL */
const API_URL =
"https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";


/* ==========================================
   COMMON FETCH HELPER
========================================== */
async function requestAPI(options = {}){

    try{

        const res = await fetch(API_URL, options);

        if(!res.ok){
            throw new Error("Server Error");
        }

        return res;

    }catch(error){

        console.log("API Error:", error);
        return null;
    }
}


/* ==========================================
   GET ALL RECORDS
========================================== */
async function getRecordsAPI(){

    const res = await requestAPI({
        method:"GET"
    });

    if(!res) return null;

    try{
        return await res.json();
    }catch(error){
        console.log("JSON Error:", error);
        return null;
    }
}


/* ==========================================
   ADD RECORD
========================================== */
async function addRecordAPI(data){

    const form =
    new URLSearchParams();

    form.append("action","add");
    form.append("name",data.name);
    form.append("mobile",data.mobile);
    form.append("amount",data.amount);
    form.append("date",data.date);
    form.append("note",data.note);

    const res = await requestAPI({
        method:"POST",
        body:form
    });

    return res ? true : false;
}


/* ==========================================
   MARK AS PAID
========================================== */
async function markPaidAPI(row){

    const form =
    new URLSearchParams();

    form.append("action","paid");
    form.append("row",row);

    const res = await requestAPI({
        method:"POST",
        body:form
    });

    return res ? true : false;
}


/* ==========================================
   DELETE RECORD
========================================== */
async function deleteRecordAPI(row){

    const form =
    new URLSearchParams();

    form.append("action","delete");
    form.append("row",row);

    const res = await requestAPI({
        method:"POST",
        body:form
    });

    return res ? true : false;
}


/* ==========================================
   CHECK CONNECTION
========================================== */
async function pingAPI(){

    const res = await requestAPI({
        method:"GET"
    });

    return res ? true : false;
}
