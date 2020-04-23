let changed_packages;
let packages = []
let user;
let insurance;

//ziska konkretnu originalnu poistku
async function get_insurance() {
    let response = await fetch(`/api/check_insurance`);
    let json = await response.json();
    insurance = json.body;
    console.log(insurance);
}

//ziska konkretneho pouzivatela, koho sa poistka tyka
async function get_user() {
    const response = await fetch(`/api/user_insurance/${insurance.user_id}`);
    const json = await response.json();
    user = json.body;
    console.log(user);
}

async function load_user() {
    await get_insurance();
    await get_user();
    
    document.getElementById("name").innerHTML = `Meno poistenca: ${user.name} ${user.surname}`;
    document.getElementById("insurance").innerHTML = `Cislo poistky: ${insurance.insurance_number}`;
}





async function get_changed_packages() {
    console.log("vytiahnutie zmenenych balikov");
    const response = await fetch('/api/all_changed_packages');
    const json = await response.json();
    changed_packages = json.body;
    console.log(changed_packages);
}

async function get_packages() {

    for(item of changed_packages) {
        const response = await fetch(`/api/package/${item.package_id}`);
        const json = await response.json();
        packages.push(json.body);
    }
    console.log(packages);
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
    let id = changed_packages[0].changed_insurance_id;

    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id}) //data odosielane v requeste
    };
    await fetch('/api/remove_changed_packages', options);

    set_msg_state(message, state);
    notify(user, message, state, true);
    notify(user, message, state);
}

async function change() {
    document.location.href = '/html/edit_changes.html'
}

async function denie() {
    document.location.href = '/html/denie.html'
}