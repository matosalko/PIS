let changed_insurances;
let selected_insurance_id;
let insurances = [];

async function get_changed_insurances() {
    const response = await fetch('/api/changed_insurance');
    const json = await response.json();
    changed_insurances = json;
}

async function get_insurances() {

    for(item of changed_insurances.body) {
        const response = await fetch(`/api/insurance/${item.insurance_id}`);
        const json = await response.json();
        insurances.push(json.body);
    }
}

async function create_table() {
    await get_changed_insurances();
    await get_insurances();

    let counter = 0;

    for(item of insurances) {
        let tbl = document.getElementById("ins_table");
        let tr = document.createElement("tr");
        tr.setAttribute('id', `tr insurance ${item.insurance_number}`);
        let text = `Cislo zmenenej poistky ${item.insurance_number}`;
        let td = document.createElement("td");
        td.setAttribute('id', `${changed_insurances.body[counter].id}`);

        td.addEventListener("click", function () {
            selected_insurance_id = this.getAttribute('id');
            // fetch(`/api/selected_insurance/${selected_insurance_id}`);
        }, false);

        td.appendChild(document.createTextNode(text));
        tr.appendChild(td);
        tbl.appendChild(tr);

        counter += 1;
    }
}

async function change_scene() {
    document.location.href = '../index.html'
}