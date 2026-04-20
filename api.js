/* ==========================================
   Khanta Payment Reminder
   FINAL PRODUCTION api.js
========================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";

/* Request timeout */
const API_TIMEOUT = 15000;


/* ==========================================
   CORE REQUEST
========================================== */
async function requestAPI(
method = "GET",
body = null
){

const controller =
new AbortController();

const timer =
setTimeout(()=>{

controller.abort();

},API_TIMEOUT);

try{

const options = {
method,
signal:
controller.signal
};

if(body){
options.body = body;
}

const res =
await fetch(
API_URL,
options
);

clearTimeout(
timer
);

if(!res.ok){
throw new Error(
"Server Error"
);
}

return res;

}catch(error){

clearTimeout(
timer
);

console.log(
"API Error:",
error
);

return null;
}

}


/* ==========================================
   GET RECORDS
========================================== */
async function getRecordsAPI(){

const res =
await requestAPI(
"GET"
);

if(!res) return null;

try{

const data =
await res.json();

return Array.isArray(data)
? data
: [];

}catch(error){

console.log(
"JSON Error:",
error
);

return [];
}

}


/* ==========================================
   ADD RECORD
========================================== */
async function addRecordAPI(data){

const form =
new URLSearchParams();

form.append(
"action","add"
);

form.append(
"name",data.name
);

form.append(
"mobile",data.mobile
);

form.append(
"amount",data.amount
);

form.append(
"date",data.date
);

form.append(
"note",data.note
);

const res =
await requestAPI(
"POST",
form
);

return !!res;

}


/* ==========================================
   MARK PAID
========================================== */
async function markPaidAPI(row){

const form =
new URLSearchParams();

form.append(
"action","paid"
);

form.append(
"row",row
);

const res =
await requestAPI(
"POST",
form
);

return !!res;

}


/* ==========================================
   DELETE
========================================== */
async function deleteRecordAPI(row){

const form =
new URLSearchParams();

form.append(
"action","delete"
);

form.append(
"row",row
);

const res =
await requestAPI(
"POST",
form
);

return !!res;

}


/* ==========================================
   HEALTH CHECK
========================================== */
async function pingAPI(){

const res =
await requestAPI(
"GET"
);

return !!res;

}
