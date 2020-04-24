let packages;
let insurance;
let user;
const changed_insurance_id = localStorage.getItem('changed_insurance_id');
const insurance_id = localStorage.getItem('insurance_id');
const user_id = localStorage.getItem('user_id');

async function get_insurance() {
    let response = await fetch(`/api/insurance/${insurance_id}`);
    let json = await response.json();
    insurance = json.body;

    console.log('Vybrata poistka');
    console.log(insurance);
}

async function get_user() {
    const response = await fetch(`/api/user/${user_id}`);
    const json = await response.json();
    user = json.body;

    console.log('Vybraty pouzivatel');
    console.log(user);
}

async function load_user() {
    await get_insurance();
    await get_user();

    document.getElementById("name").innerHTML = `Meno poistenca: ${user.name} ${user.surname}`;
    document.getElementById("insurance").innerHTML = `Cislo poistky: ${insurance.insurance_number}`;
}

async function get_packages() {
    const response = await fetch('/api/package_all');
    const json = await response.json();
    packages = json.body;

    console.log('Vsetky baliky');
    console.log(packages);
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

        label.setAttribute('for', `${item.name}`);
        box.setAttribute('type', 'checkbox');
        box.setAttribute('id', `${item.id}`);

        label.appendChild(document.createTextNode(item.name));

        td1.appendChild(label);
        td2.appendChild(box);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

async function send_change() {;
    let message = document.getElementById("message").value;
    let state = 'upravena';
    let new_packages = [];



    for(item of packages) {
        if (document.getElementById(`${item.id}`).checked) {
            new_packages.push(item.id);
        }
    }

    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({changed_insurance_id}) //data odosielane v requeste
    };
    await fetch('/api/remove_changed_packages/', options);

    for(item of new_packages){
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({item, changed_insurance_id}) //data odosielane v requeste
        };
        await fetch('/api/insert_changed_packages/', options);
    }

    set_msg_state(message, state);
    // notify(user, message, state);
}

async function send_denie() {
    let message = document.getElementById("message").value;
    let state = 'odmietnuta';

    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({changed_insurance_id}) //data odosielane v requeste
    };
    await fetch('/api/remove_changed_packages/', options);

    set_msg_state(message, state);
    notify(user, message, state);
}