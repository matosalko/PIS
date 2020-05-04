let packages;
let insurance;
let changed_insurance;
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

async function get_changed_insurance() {
    let response = await fetch(`/api/get_changed_insurance/${changed_insurance_id}`);
    let json = await response.json();
    changed_insurance = json.body;
}

async function get_user() {
    const response = await fetch(`/api/user/${insurance.user_id}`);
    const json = await response.json();
    user = json.body;

    console.log('Vybraty pouzivatel');
    console.log(user);
}

async function load_user() {
    await get_insurance();
    await get_changed_insurance();
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
    let price = 0;
    let discount;

    for(item of packages) {
        if (document.getElementById(`${item.id}`).checked) {
            new_packages.push(item.id);
            console.log(item);
            price += item.price;
        }
    }

    discount = price * (changed_insurance.discount / 100);
    price -= discount;

    let options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({changed_insurance_id}) //data odosielane v requeste
    };
    await fetch('/api/remove_changed_packages/', options);

    for(package_id of new_packages){
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({package_id, changed_insurance_id}) //data odosielane v requeste
        };
        await fetch('/api/insert_changed_packages/', options);
    }

    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({price, changed_insurance_id}) //data odosielane v requeste
    };
    await fetch('/api/update_change_insurance_price/', options);

    set_msg_state(message, state);
    notify(user, message, state);
    alert("Zmena poistnej zmluvy bola upravená.");
    document.location.href = '/html/employee.html';
}

async function send_denie() {
    let message = document.getElementById("message").value;
    let state = 'odmietnuta';

    // let options = {
    //     method: 'DELETE',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({changed_insurance_id}) //data odosielane v requeste
    // };
    // await fetch('/api/remove_changed_packages/', options);

    set_msg_state(message, state);
    notify(user, message, state);
    alert("Zmena poistnej zmluvy bola zamietnutá.");
    document.location.href = '/html/employee.html';
}