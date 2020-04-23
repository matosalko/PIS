let changed_insurances;
let changed_insurance_id;
let insurances = [];

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

async function myFunction(x) {
    let ids = x.id.split(" ");

    await fetch(`/api/set_insurance/${ids[1]}`);
    await fetch(`/api/set_changed_insurance/${ids[0]}`);
    changed_insurance_id = ids[0];
}

async function create_table() {
    await get_changed_insurances();
    await get_insurances();

    for(item of insurances) {
        let tbl = document.getElementById("ins_table");
        let tr = document.createElement("tr");
        let text = `Cislo zmenenej poistky ${item.insurance_number}`;
        let td = document.createElement("td");

        td.setAttribute('id', `${item.change_ins_id} ${item.id}`);
        td.setAttribute('onclick', "myFunction(this)")

        td.appendChild(document.createTextNode(text));
        tr.appendChild(td);
        tbl.appendChild(tr);
    }
}

async function change_scene() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({changed_insurance_id}) //data odosielane v requeste
    };

    await fetch('/api/set_changed_insurance/', options);
    console.log("button");
    document.location.href = '/html/check.html';
}