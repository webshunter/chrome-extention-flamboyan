
document.body.appendChild(
    div().id('programmer').html(`
<div class="modal" id="m-cron" role="dialog" tabindex="-1" aria-hidden="false" style="display: none;">
    <div class="modal-header">
        <h3>Catch Logic</h3>
        <div style="display:grid;grid-template-columns: 120px auto 120px; grid-gap: 20px;">
            <button style="height: 100%;" id="copy-code">copy code</button>
            <div class="form-group">
                <input id="table-id" style="width:100%; height: 100%;" type="text" placeholder="table" class="form-control w-100" />
            </div>
            <button style="height: 100%;" id="replace-code">Muat Ulang</button>
        </div>
    </div>
    <div class="modal-body">
    </div>
</div>
    `).get()
);

const loadData = function () {
    let btnCopy = _id('copy-code');
    let tableId = _id('table-id');
    btnCopy.onclick = function(){
        copyText(_id('programmer').querySelector('pre'));
    };
    document.body.appendChild(
        el('button')
            .class('btn btn-primary')
            .css({
                display: 'block',
                position: 'fixed',
                right: '10px',
                bottom: '10px',
                zIndex: '9999',
            })
            .text('Lihat Data')
            .click(function () {
                let d = _id("m-cron").style.display;
                if (d === 'block') {
                    _id("m-cron").style.display = 'none';
                } else {
                    _id("m-cron").style.display = 'block';
                };

                String.prototype.replaceAll = function (search, replacement) {
                    var target = this;
                    return target.split(search).join(replacement);
                };

                let getLable = function (x) {
                    if (x.parentNode.querySelector('label')) {
                        return x.parentNode.querySelector('label').innerHTML;
                    } else {
                        return getLable(x.parentNode);
                    }
                }
                let title = document.querySelector(".page-header h1").innerText;
                let locations = (function locks(loc) {
                    let e = loc ? loc : location.href.split('/');
                    let h = e.pop();
                    if (h != "") {
                        return h
                    } else {
                        return locks(e);
                    }
                })();

                let tablePredictions = (function (t) {
                    let table = t;
                    if (t.indexOf('detail') != -1) {
                        table = table.replaceAll("detail", "");
                    }
                    if (t.indexOf('ubah') != -1) {
                        table = table.replaceAll("ubah", "");
                    }
                    if (t.indexOf('tambah') != -1) {
                        table = table.replaceAll("tambah", "");
                    }
                    return table;
                })(locations);
                
                tableId.value = tablePredictions;

                let tableDb = (function(table){
                    let dataTable = database.cond(table, 'table');
                    let [tb] = dataTable;
                    let tbl = {};

                    dataTable.forEach(function(o){
                        if(!tbl[o.columns]){
                            tbl[o.columns] = o.type;
                        }
                    });

                    return {
                        table: tb?tb.table:null,
                        data: tb?dataTable:[],
                        tbl: Object.keys(tbl)
                    }

                })(tablePredictions);

                let [getForm] =
                    Array.from(document.querySelectorAll('form')).filter(function (e) {
                        if (e.enctype.indexOf('multipart/form-data') != -1) {
                            return e
                        }
                    });

                let predictionName = function(w){
                    let pre = tableDb.tbl.filter(function(o){
                        if(w.indexOf(o) != -1){
                            return o;
                        }
                    }).map(function(o){
                        return {
                            name : o,
                            tot : w.length - o.length
                        };
                    });
                    let name = null;
                    let cek = null;
                    pre.forEach(function(p){
                        if(!cek){
                            cek = p.tot;
                            name = p.name;
                        }else{
                            if(p.tot < cek){
                                cek = p.tot;
                                name = p.name;
                            }
                        }
                    });
                    if(!name){
                        return {
                            prediction: false,
                            name: w
                        };
                    }else{
                        return {
                            prediction: true,
                            name: name
                        };
                    }
                }

                let gtF = Array.from(getForm.querySelectorAll('[name]'))
                    .map(function (s) {
                        let g = predictionName(s.name.replace(/\[]/gi, ""));
                        let tag = s.tagName;
                        let par = getLable(s);
                        return {
                            label: par,
                            prediction: g.prediction,
                            name: g.name,
                            type: tag == 'SELECT' ? `select` : tag == "INPUT" ? s.type : ""
                        }
                    });

                let selectData = gtF.cond('select', 'type');

                let m = selectData.map(function (w) {
                    let name = w.name;
                    let [dataBase] = database.like('table', name);
                    if (dataBase != undefined) {
                        return {
                            name: name,
                            data: dataBase ? dataBase.table : null
                        }
                    } else {
                        return {
                            name: name,
                            data: null
                        }
                    }
                });

                let ya = m.filter(function (q) {
                    if (q.data != null) {
                        return q;
                    }
                });

                let yx = m.filter(function (q) {
                    if (q.data == null) {
                        return q;
                    }
                });


                let field = JSON.stringify(gtF).split("},{").join(`},
        ,{`)
                    .replace(/\[{/gi, `[
        {`)
                    .replace(/\","/gi, `"
            ,"`)
                    .replace(/\},/gi, `"
        },`)
                    .replace(/\{"/gi, `{
            "`)
                    .replace(/\{"/gi, `{
            "`);

                field = field.replaceAll(`},
        ,{`, `}
        ,{`)

                field = field.replaceAll(`}]`, `
        }
    ]`)
                field = field.replaceAll(`false,`, `false
            ,`)
                field = field.replaceAll(`true,`, `true
            ,`)
                field = field.replaceAll(`""`, `"`)


                let predictionFalse  = gtF.filter(function(p){
                    if(p.prediction == false){
                        return p;
                    }
                }).map(function(p){
                    return `----------- //
field : ${p.name} ########
judul : ${p.label}
###### ------------ cek ulang data field
                        `;
                }).join("\n");

                let temp = `
/*
${predictionFalse}
*/
export const ${locations} = {/** DATA FAMILY */
    id: 'id_${tablePredictions}',
    title: '${title}',
    table: '${tablePredictions}',
    tableShow: '${tablePredictions}',
    dataCall: [
    ],
    singleData: true,
    noCodeShow: true,
    field: ${field}
};
   `;
                _id("programmer").querySelector('.modal-body').innerHTML = `
                
                <div>
                    <pre>
                        ${temp}
                    </pre>
                </div>
            `;
                AuditDevQuery(datalogin, `SELECT * FROM user`, function (res) {
                })

            })
            .get()
    )


};

loadData();