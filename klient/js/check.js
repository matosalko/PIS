let changed_packages;
let packages = []
let user;
let selected_insurance_id;
let insurance;

async function get_changed_packages() {
    const response = await fetch('/api/changed_packages');
    const json = await response.json();
    changed_packages = json.body;
}

async function get_packages() {

    for(item of changed_packages) {
        const response = await fetch(`/api/package/${item.package_id}`);
        const json = await response.json();
        packages.push(json.body);
    }
}

async function get_insurance() {
    let response = await fetch('/api/selected_insurance');
    let json = await response.json();
    selected_insurance_id = json.body;

    response = await fetch(`/api/insurance/${selected_insurance_id}`);
    json = await response.json();
    insurance = json.body;
}

async function get_user() {
    const response = await fetch(`/api/user_insurance/${insurance.user_id}`);
    const json = await response.json();
    user = json.body;
}

async function load_user() {
    await get_insurance();
    await get_user();

    document.getElementById("name").innerHTML = `Meno poistenca: ${user.name} ${user.surname}`;
    document.getElementById("insurance").innerHTML = `Cislo poistky: ${insurance.insurance_number}`;
}

async function load_packages() {
    await get_changed_packages();
    await get_packages();

    for(item of packages) {
        let tbl = document.getElementById("ins_table");
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let text1 = item.name;
        let text2 = item.description;

        td1.appendChild(document.createTextNode(text1));
        td2.appendChild(document.createTextNode(text2));

        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

async function accept() {
    // document.location.href = '/html/check.html'
    console.log('stranka vo vystavbe');
}

async function change() {
    document.location.href = '/html/change.html'
}

async function denie() {
    // document.location.href = '/html/check.html'
    console.log('stranka vo vystavbe');
}