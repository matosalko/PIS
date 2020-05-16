const insurance_id = localStorage.getItem('selected_insurance_id');
let packages;
let packages_in_insurance;
let pzp_before = false;
let pzp_after = false;
let vehicle;
let insurance;

async function get_all_packages() {
    let response = await fetch(`/api/package_all`);
    let json = await response.json();
    packages = json.body;
    
    response = await fetch(`/api/packages/${insurance_id}`);
    json = await response.json();
    packages_in_insurance = json.body;
}

async function get_insurance() {
    const response = await fetch(`/api/insurance/${insurance_id}`);
    const json = await response.json();

    insurance = json.body;
}

async function get_vehicle() {
    await get_insurance();
    const response = await fetch(`/api/vehicle/${insurance.vehicle_id}`);
    const json = await response.json();

    vehicle = json.body;
}

async function show_packages() {
    await get_all_packages();
    await get_vehicle();

    let title = document.getElementById('insurance_title');
    title.innerHTML = `Poistenie vozidla ${vehicle.ecv}`
    create_table();
}

function create_table() {
    for(item of packages) {
        let tbl = document.getElementById("packages_table");
        let tr = document.createElement("tr");
        let box = document.createElement("input");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");
        
        let name = `${item.name}`;
        let info = `${item.description}`;
        
        box.setAttribute('type', 'checkbox');
        box.setAttribute('id', `${item.id}`);
        let pack = packages_in_insurance.find(package => package.package_id == item.id)
        if(pack) {
            if(name == 'PZP') {
                pzp_before = true;
            }
            box.setAttribute('checked', 'true');
        }

        td1.appendChild(document.createTextNode(name));
        td2.appendChild(document.createTextNode(info));
        td3.appendChild(box);
        
        tr.appendChild(td3);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbl.appendChild(tr);
    }
}

async function change_packages() {
    pzp_after = false;

    let changed_packages = []
    for(item of packages) {
        if(document.getElementById(item.id).checked == true) {
            let changed_package = {
                'changed_insurance_id': null,
                'package_id': item.id
            };
            changed_packages.push(changed_package);
            if(item.name == 'PZP') {
                pzp_after = true;
            }
        }
    }

    if(pzp_before == true && pzp_after == false) {
        //zistit ci je menej ako 6 tyzdnov pred koncom
        let response = await fetch(`/api/insurance/${insurance_id}`);
        let json = await response.json();
        insurance = json.body;

        let end_date = insurance.insurance_end_date.split('T')[0];
        
        let current_date = await get_current_date();
        let days_between = await get_days_between(current_date, end_date);

        if(days_between < 42) {
            alert('PZP sa nedá odstrániť, pretože je menej ako ž týždňov pred koncom poistného obdobia!');
        }
        else{
            localStorage.setItem('changed_insurance_packages', JSON.stringify(changed_packages));
            document.location.href = 'contract_proposal.html';
        }
    }
    else {
        localStorage.setItem('changed_insurance_packages', JSON.stringify(changed_packages));
        document.location.href = 'contract_proposal.html';
    }
   
}