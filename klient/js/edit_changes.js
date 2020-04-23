let packages;
let new_packages = [];
let user;
let insurance_id;
let insurance;
let changed_insurance;

async function get_insurance() {
    let response = await fetch('/api/get_insurance_id');
    let json = await response.json();
    insurance_id = json.body;


    response = await fetch(`/api/get_insurance`);
    json = await response.json();
    insurance = json.body;

    console.log(insurance);
}

async function get_user() {
    const response = await fetch(`/api/get_user`);
    const json = await response.json();
    user = json.body;
}

async function load_user() {
    await get_insurance();
    await get_user();

    document.getElementById("name").innerHTML = `Meno poistenca: ${user.name} ${user.surname}`;
    document.getElementById("insurance").innerHTML = `Cislo poistky: ${insurance.insurance_number}`;
}

async function get_packages() {
    const response = await fetch(`/api/package_all`);
    const json = await response.json();
    packages = json.body;
}

async function load_packages() {
    await get_packages();

    for(item of packages) {
        let tbl = document.getElementById("table");
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let label = document.createElement("label");
        let box = document.createElement("input");

        label.setAttribute("for", `${item.name}`);
        box.setAttribute('type', 'checkbox');
        box.setAttribute('id', `${item.id}`);
        box.setAttribute('name', `${item.name}`);
        box.setAttribute('id', `${item.id}`);

        label.appendChild(document.createTextNode(item.name));

        td1.appendChild(label);
        td2.appendChild(box);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

async function send_change() {
    let message = document.getElementById("message").value;
    let state = 'upravena';
    console.log(document.getElementById("message").value);

    for(item of packages) {
        if (document.getElementById(`${item.id}`).checked) {
            new_packages.push(item.id);
        }
    }

    const response = await fetch('/api/get_changed_insurance');
    const json = await response.json();
    changed_insurance = json.body;

    id = changed_insurance.id

    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id}) //data odosielane v requeste
    };
    await fetch('/api/remove_changed_packages', options);

    for(item of new_packages){
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({item, id}) //data odosielane v requeste
        };
        await fetch('/api/insert_changed_packages', options);
    }

    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message, state, id}) //data odosielane v requeste
    };

    await fetch('/api/update_change_insurance', options);
    document.location.href = '../index.html';
}

async function send_denie() {
    let message = document.getElementById("message").value;
    let state = 'odmietnuta';
    console.log("odmietnute odoslane");
}