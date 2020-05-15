let changed_packages;
let packages = []
let user;
let insurance;
const changed_insurance_id = localStorage.getItem('changed_insurance_id');
const insurance_id = localStorage.getItem('insurance_id');
const user_id = localStorage.getItem('user_id');

//ziska konkretnu originalnu poistku
async function get_insurance() {
    let response = await fetch(`/api/insurance/${insurance_id}`);
    let json = await response.json();
    insurance = json.body;
}

//ziska konkretneho pouzivatela, koho sa poistka tyka
async function get_user() {
    const response = await fetch(`/api/user/${insurance.user_id}`);
    const json = await response.json();
    user = json.body;
}

async function load_user() {
    await get_insurance();
    await get_user();
    
    document.getElementById('name').innerHTML = `Meno poistenca: ${user.name} ${user.surname}`;
    document.getElementById('insurance').innerHTML = `Číslo poistky: ${insurance.insurance_number}`;
}

async function get_changed_packages() {
    const response = await fetch(`/api/all_changed_packages/${changed_insurance_id}`);
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
    let message = '';
    let state = 'prijata';

    let response = await fetch(`/api/get_changed_insurance/${changed_insurance_id}`);
    let json = await response.json();
    changed_insurance = json.body;

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({insurance_id})
    };

    await fetch('/api/end_insurance/', options);

    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({insurance, changed_insurance})
    };

    response = await fetch('/api/new_insurance/', options);
    json = await response.json();
    let new_id = json.body;

    for(package of changed_packages) {
        package_id = package.package_id;
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({package_id, new_id}) //data odosielane v requeste
        };
        await fetch('/api/insert_packages/', options);
    }

    set_msg_state(message, state);
    notify(user, message, state, true);
    notify(user, message, state);
    alert("Zmena poistnej zmluvy bola prijatá.");
    document.location.href = '/html/employee.html';
}

function change() {
    document.location.href = '/html/edit_changes.html'
}

function denie() {
    document.location.href = '/html/denie.html'
}