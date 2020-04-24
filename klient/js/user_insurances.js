
const user_id = localStorage.getItem('user_id');
let insurances;
let selected_insurance;

async function get_insurances() {
    const response = await fetch(`/api/insurance/user/${user_id}`);
    const json = await response.json();
    insurances = json.body;
    create_table();
}

function create_table() {
    for(item of insurances) {
        let tbl = document.getElementById("ins_table");
        let tr = document.createElement("tr");
        let td2 = document.createElement("td");

        let text2 = `${item.insurance_number}`;
        

        td2.setAttribute('id', `${item.id}`);
        td2.setAttribute('onclick', "select_insurance(this.id)")

        td2.appendChild(document.createTextNode(text2));
        
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

function select_insurance(insurance_id) {
    selected_insurance = insurances.find(item => item.id == insurance_id);
    localStorage.setItem('selected_insurance_id', selected_insurance.id);
}

function change_scene() {
    let changed_insurance = {
        'insurance_id': selected_insurance.id,
        'state': 'neskontrolovana',
        'message': null,
        'price': null,
        'discount': null
    };

    localStorage.setItem('changed_insurance', JSON.stringify(changed_insurance));
    document.location.href = 'select_packages.html';
}