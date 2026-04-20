/* ==========================================
   Khanta Payment Reminder
   FINAL GET BASED api.js
   No POST / Android Safe / GitHub Safe
========================================== */

var API_URL =
"https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";


/* ==========================================
   CORE FETCH
========================================== */
function fetchJSON(url){

return fetch(url,{
method:"GET",
cache:"no-store",
redirect:"follow"
})

.then(function(res){
return res.text();
})

.then(function(txt){

if(!txt || txt === ""){
return [];
}

try{
return JSON.parse(txt);
}catch(e){
console.log(
"JSON Error:",e
);
return [];
}

})

.catch(function(err){

console.log(
"Fetch Error:",err
);

return [];
});

}


/* ==========================================
   GET RECORDS
========================================== */
function getRecordsAPI(){

var url =
API_URL +
"?t=" +
new Date().getTime();

return fetchJSON(url);

}


/* ==========================================
   ADD RECORD
========================================== */
function addRecordAPI(data){

var url =
API_URL +
"?action=add" +

"&name=" +
encodeURIComponent(
data.name
) +

"&mobile=" +
encodeURIComponent(
data.mobile
) +

"&amount=" +
encodeURIComponent(
data.amount
) +

"&date=" +
encodeURIComponent(
data.date
) +

"&note=" +
encodeURIComponent(
data.note
) +

"&t=" +
new Date().getTime();

return fetchJSON(url)
.then(function(){
return true;
})
.catch(function(){
return false;
});

}


/* ==========================================
   MARK PAID
========================================== */
function markPaidAPI(row){

var url =
API_URL +
"?action=paid" +

"&row=" +
encodeURIComponent(
row
) +

"&t=" +
new Date().getTime();

return fetchJSON(url)
.then(function(){
return true;
})
.catch(function(){
return false;
});

}


/* ==========================================
   DELETE
========================================== */
function deleteRecordAPI(row){

var url =
API_URL +
"?action=delete" +

"&row=" +
encodeURIComponent(
row
) +

"&t=" +
new Date().getTime();

return fetchJSON(url)
.then(function(){
return true;
})
.catch(function(){
return false;
});

}


/* ==========================================
   PING
========================================== */
function pingAPI(){

var url =
API_URL +
"?t=" +
new Date().getTime();

return fetch(url,{
method:"GET",
cache:"no-store"
})

.then(function(){
return true;
})

.catch(function(){
return false;
});

}   ADD RECORD
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
