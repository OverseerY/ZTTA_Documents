'use strict';

let srv_url = Symbol("server");
srv_url = 'http://192.168.0.14:8080/';
let file_url = Symbol("json_file");
file_url = 'scripts/data.json';
let doc_url = Symbol("docfiles");
doc_url = '/docfiles/';
let headers = ["Тип документа","Номер","Автор","Статус","Кем подписан","Дата","Имя документа"];
let signSuccess = Symbol("signed");
let signFail = Symbol("decline");
signSuccess = "OK";
signFail = "Отклонен";
let docType1 = Symbol("raskroy");
let docType2 = Symbol("zakaz");
let docType3 = Symbol("zayavka");
docType1 = "Раскройный цех";
docType2 = "Общий заказ";
docType3 = "Заявка";

function startPoint() {
    loadJson(srv_url, function (response) {
        parseJson(response);
    });
}

function loadJson(url, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function parseJson(response) {
    let raw_array  = JSON.parse(response);
    let docs = new Documents(raw_array[Object.keys(raw_array)[0]]);
    buildTable(docs.documents_array);
}

function buildTable(data_array) {
    let table = document.createElement("table");
    table.setAttribute("id", "data_table");
    table.setAttribute("class", "table table-striped table-bordered");

    let col = [];
    for (let i = 0; i < data_array.length; i++) {
        for (let key in data_array[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    let t_header = table.createTHead();
    let thr = t_header.insertRow(-1);
    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");
        th.innerHTML = headers[i];
        thr.appendChild(th);
    }

    let t_body = table.createTBody();
    for (let i = 0; i < data_array.length; i++) {
        let tr = t_body.insertRow(-1);
        for (let j = 0; j < col.length; j++) {
            let tabCell = tr.insertCell(-1);
            if (j === 0) {
                if (data_array[i][col[j]] === "raskroy") {
                    tabCell.innerHTML = '<span class="badge badge-dark">' + docType1 + '</span>';
                } else if (data_array[i][col[j]] === "zakaz") {
                    tabCell.innerHTML = '<span class="badge badge-primary">' + docType2 + '</span>';
                } else if (data_array[i][col[j]] === "zayavka") {
                    tabCell.innerHTML = '<span class="badge badge-info">' + docType3 + '</span>';
                }
            } else if (j === 3) {
                if (data_array[i][col[j]] === "signed") {
                    tabCell.innerHTML = '<span class="badge badge-success badge-pill">' + signSuccess + '</span>';
                } else if (data_array[i][col[j]] === "decline") {
                    tabCell.innerHTML = '<span class="badge badge-danger badge-pill">' + signFail + '</span>';
                } else {
                    tabCell.innerHTML = '<span class="badge badge-warning badge-pill">' + data_array[i][col[j]] + '</span>';
                }
            } else if (j === 5) {
                tabCell.innerHTML = convertMillisToDate(data_array[i][col[j]]);
            } else if (j === 6) {
                let a = document.createElement('a');
                a.setAttribute('href',doc_url + data_array[i][col[j]]);
                a.innerHTML = data_array[i][col[j]];
                tabCell.appendChild(a);
            } else {
                tabCell.innerHTML = data_array[i][col[j]];
            }
        }
    }

    let divContainer = document.getElementById("main_table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    createDataTable(table.getAttribute("id"));
}

function convertMillisToDate(value) {
    let str = "-";
    if (value !== null) {
        let date = new Date(parseInt(value, 10) * 1000);
        let aYear = date.getFullYear();
        let aMonth = date.getMonth() + 1;
        let aDay = date.getDate();
        let aHour = date.getHours();
        let aMinute = date.getMinutes();
        str = aYear + "/" + formatDateTwoSign(aMonth) + "/" + formatDateTwoSign(aDay) + " " + formatDateTwoSign(aHour) + ":" + formatDateTwoSign(aMinute);
    }
    return str;
}

function formatDateTwoSign(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return value;
    }
}

function createDataTable(mTable) {
    let table_name = '#' + mTable;
    $(document).ready(function() {
        $(table_name).DataTable({
            "order": [[ 1, "desc" ]],
            language: {
                url: 'scripts/Russian.json'
            }
        });
    });
}


class Documents {
    constructor(docs_array) {
        this.docs_array = docs_array;
    }
    get documents_array() {
        return this.docs_array;
    }
    ranged_documents_array(start, end) {
        return this.documents_array.slice(start, end);
    }
}