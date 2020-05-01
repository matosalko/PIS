let changed_insurances;
let changed_insurance_id;
let insurances = [];
let cars;

//ziska vsetky zmenenych poistiek
async function get_changed_insurances() {
    const response = await fetch('/api/all_changed_insurances');
    const json = await response.json();
    changed_insurances = json.body;

    console.log('Zmenene poistky');
    console.log(changed_insurances);
}

//ziska originalne poistky, ktorych sa tykaju zmeny
async function get_insurances() {
    for(item of changed_insurances) {
        const response = await fetch(`/api/insurance/${item.insurance_id}`);
        const json = await response.json();
        json.body.change_ins_id = item.id; //pridanie id zmenenej poistky
        insurances.push(json.body);
    }
    console.log('Originalne poistky');
    console.log(insurances);
}

function set_ids(ids) {
    ids = ids.split(' ');

    localStorage.setItem('changed_insurance_id', ids[0]);
    localStorage.setItem('insurance_id', ids[1]);

    console.log('ID poistky a jej zmenenej verzie');
    console.log(ids[1] + ' ' + ids[0]);
}

async function create_table() {
    await get_changed_insurances();
    await get_insurances();

    let counter = 1;

    for(item of insurances) {
        let tbl = document.getElementById('ins_table');
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');

        let text1 = `${counter}`;
        let text2 = `${item.insurance_number}`;

        td2.setAttribute('id', `${item.change_ins_id} ${item.id}`);
        td2.setAttribute('onclick', 'set_ids(this.id)');

        td1.appendChild(document.createTextNode(text1));
        td2.appendChild(document.createTextNode(text2));
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);

        counter += 1;
    }
}

function change_scene() {
    document.location.href = '/html/check.html';
}
function log_off() {
    document.location.href = '../index.html';
}