let changed_insurances;
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

    for(item of insurances) {
        let ul = document.getElementById("insurances");
        let text = `Cislo zmenenej poistky ${item.insurance_number}`;
        let li = document.createElement("li");
        li.setAttribute('id', 'insurance');
        li.appendChild(document.createTextNode(text));
        ul.appendChild(li);
    }
}