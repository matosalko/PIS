let changed_packages = JSON.parse(localStorage.getItem('changed_insurance_packages'));
let changed_insuracne = JSON.parse(localStorage.getItem('changed_insurance'));
let user;
let insurance;
let packages = [];
let vehicle;
const user_id = localStorage.getItem('user_id');
const insurance_id = localStorage.getItem('selected_insurance_id');
let total_price = 0;

async function get_user() {
    const response = await fetch(`/api/user/${user_id}`);
    const json = await response.json();

    user = json.body;
}

async function get_insurance() {
    const response = await fetch(`/api/insurance/${insurance_id}`);
    const json = await response.json();

    insurance = json.body;
}

async function get_packages() {
    for(item of changed_packages) {
        const response = await fetch(`/api/package/${item.package_id}`);
        const json = await response.json();
        packages.push(json.body);
    }
}

async function get_vehicle() {
    const response = await fetch(`/api/vehicle/${insurance.vehicle_id}`);
    const json = await response.json();

    vehicle = json.body;
}

//zisti, ci ma poistenec pravo na vernostnu zlavu
function chceck_for_discount() {
    //tu sa zisti ci ma narok na zlavu a ak ano tak sa prida do changed_insurance zlava v percentach
}

function add_info_to_row(id, text) {
    let tr = document.getElementById(id);
    let td = document.createElement("td");
    td.appendChild(document.createTextNode(text));
    tr.appendChild(td);
}

function add_row(name, text) {
    let tbl = document.getElementById("packages_table");
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    
    // let name = `${item.name}`;
    // let price = item.price;
    // total_price += price;

    td1.appendChild(document.createTextNode(name));
    td2.appendChild(document.createTextNode(text));
    
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbl.appendChild(tr);
}

async function create_proposal() {
    await get_user();
    await get_insurance();
    await get_packages();
    await get_vehicle();

    //pridanie riadkov s balikmi v upravenej zmluve
    for(item of packages) {
        add_row(item.name, item.price);
        total_price += item.price;
    }

    //pridanie riadku so zlavou
    let discount = changed_insuracne.discount || 0;
    add_row('zlava', discount);

    //pridanie riadku s celkovou cenou poistky
    total_price -= discount;
    add_row('cena celkovo', total_price);
    

    //pridnaie info do tabulky info
    add_info_to_row('insured_user_name', user.name);
    add_info_to_row('insurance_number', insurance.insurance_number);
    add_info_to_row('phone', user.phone);
    add_info_to_row('SPZ', vehicle.ecv);
}

async function approve() {
    //prida info o cene do zmenenej poistky
    changed_insuracne.price = total_price;

    //vlozi zmenenu poistku do databazy
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changed_insuracne)  //data odosielane v requeste
    };
    const response = await fetch(`/api/changed_insurance/`, options);
    const json = await response.json();
    const changed_insurance_id = json.body;

    //vlozi baliky patriace zmenenej poistky do databazy
    for(item of changed_packages) {
        let package_id = item.package_id;
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({package_id, changed_insurance_id}) //data odosielane v requeste
        };
        await fetch('/api/insert_changed_packages/', options);
    }

    localStorage.removeItem('changed_insurance_packages');
    localStorage.removeItem('changed_insurance');
    localStorage.removeItem('selected_insurance_id');

    document.location.href = 'client.html';
}

function refuse() {
    localStorage.removeItem('changed_insurance_packages');

    document.location.href = 'select_packages.html';
}