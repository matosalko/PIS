const insurance_id = localStorage.getItem('selected_insurance_id');
let packages;
let packages_in_insurance;

async function get_all_packages() {
    let response = await fetch(`/api/package_all`);
    let json = await response.json();
    packages = json.body;
    
    response = await fetch(`/api/packages/${insurance_id}`);
    json = await response.json();
    packages_in_insurance = json.body;
}

async function show_packages() {
    await get_all_packages();

    create_table();
}

function create_table() {
    for(item of packages) {
        let tbl = document.getElementById("packages_table");
        let tr = document.createElement("tr");
        let box = document.createElement("input");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        
        let name = `${item.name}`;
        let info = `${item.description}`;
        
        box.setAttribute('type', 'checkbox');
        box.setAttribute('id', `${item.id}`);
        if(packages_in_insurance.find(package => package.package_id == item.id)) {
            box.setAttribute('checked', 'true');
        }

        td1.appendChild(document.createTextNode(name));
        td2.appendChild(document.createTextNode(info));
        
        tr.appendChild(box);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

function change_packages() {
    

    let changed_packages = []
    for(item of packages) {
        if(document.getElementById(item.id).checked == true) {
            let changed_package = {
                'changed_insurance_id': null,
                'package_id': item.id
            };
            changed_packages.push(changed_package);
        }
    }
    localStorage.setItem('changed_insurance_packages', JSON.stringify(changed_packages));

    document.location.href = 'contract_proposal.html';
}