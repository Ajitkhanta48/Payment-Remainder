/* ==========================================
   Payment Reminder API Client
   Single-source implementation
========================================== */

var API_URL =
"https://script.google.com/macros/s/AKfycby8zE_4fozs1ps3wmF3yj_DQPcuO7akkXEM1z_pD1z3X4J2caCQW8pocTTacPP9X3BbgA/exec";

function safeParseJSON(text, fallback) {
    if (!text) return fallback;

    try {
        return JSON.parse(text);
    } catch (e) {
        return fallback;
    }
}

function hasSuccessFlag(payload) {
    if (!payload || typeof payload !== "object") return false;

    if (payload.success === true) return true;
    if (payload.ok === true) return true;

    if (typeof payload.status === "string") {
        return payload.status.toLowerCase() === "success";
    }

    if (typeof payload.result === "string") {
        return payload.result.toLowerCase() === "success";
    }

    return false;
}

function fetchJSON(url) {
    return fetch(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow"
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            return res.text();
        })
        .then(function (txt) {
            return safeParseJSON(txt, []);
        })
        .catch(function () {
            return [];
        });
}

function requestAction(action, params) {
    var key;
    var pairs = [];

    pairs.push("action=" + encodeURIComponent(action));

    for (key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            pairs.push(
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(params[key] == null ? "" : String(params[key]))
            );
        }
    }

    pairs.push("t=" + encodeURIComponent(String(new Date().getTime())));

    return fetch(API_URL + "?" + pairs.join("&"), {
        method: "GET",
        cache: "no-store",
        redirect: "follow"
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            return res.text();
        })
        .then(function (txt) {
            var parsed = safeParseJSON(txt, null);

            if (hasSuccessFlag(parsed)) {
                return true;
            }

            if (parsed === null && txt) {
                var normalized = txt.toLowerCase();
                if (normalized.indexOf("success") !== -1 || normalized.indexOf("ok") !== -1) {
                    return true;
                }
            }

            return false;
        })
        .catch(function () {
            return false;
        });
}

/* ==========================================
   READ
========================================== */
var getRecordsAPI = function () {
    var url = API_URL + "?t=" + new Date().getTime();
    return fetchJSON(url);
};

/* ==========================================
   CREATE
========================================== */
var addRecordAPI = function (data) {
    return requestAction("add", {
        name: data && data.name,
        mobile: data && data.mobile,
        amount: data && data.amount,
        date: data && data.date,
        note: data && data.note
    });
};

/* ==========================================
   UPDATE (MARK PAID)
========================================== */
var markPaidAPI = function (row) {
    return requestAction("paid", {
        row: row
    });
};

/* ==========================================
   DELETE
========================================== */
var deleteRecordAPI = function (row) {
    return requestAction("delete", {
        row: row
    });
};

/* ==========================================
   HEALTH CHECK
========================================== */
var pingAPI = function () {
    var url = API_URL + "?t=" + new Date().getTime();

    return fetch(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow"
    })
        .then(function (res) {
            return !!res.ok;
        })
        .catch(function () {
            return false;
        });
};

/* ==========================================
   GLOBAL EXPORT
========================================== */
window.getRecordsAPI = getRecordsAPI;
window.addRecordAPI = addRecordAPI;
window.markPaidAPI = markPaidAPI;
window.deleteRecordAPI = deleteRecordAPI;
window.pingAPI = pingAPI;    return requestAction("paid", {
        row: row
    });
};

/* ==========================================
   DELETE
========================================== */
var deleteRecordAPI = function (row) {
    return requestAction("delete", {
        row: row
    });
};

/* ==========================================
   HEALTH CHECK
========================================== */
var pingAPI = function () {
    var url = API_URL + "?t=" + new Date().getTime();

    return fetch(url, {
        method: "GET",
        cache: "no-store",
        redirect: "follow"
    })
        .then(function (res) {
            return !!res.ok;
        })
        .catch(function () {
            return false;
        });
};

/* ==========================================
   GLOBAL EXPORT
========================================== */
window.getRecordsAPI = getRecordsAPI;
window.addRecordAPI = addRecordAPI;
window.markPaidAPI = markPaidAPI;
window.deleteRecordAPI = deleteRecordAPI;
window.pingAPI = pingAPI;
