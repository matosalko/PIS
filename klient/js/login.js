async function validateEmail(email) {
    const body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/validator/types">\n' +
        '   <soapenv:Header/>\n' +
        '   <soapenv:Body>\n' +
        '      <typ:validateEmail>\n' +
        '         <email>' + email + '</email>\n' +
        '      </typ:validateEmail>\n' +
        '   </soapenv:Body>\n' +
        '</soapenv:Envelope>';


    const response = await fetch('http://pis.predmety.fiit.stuba.sk/pis/ws/Validator', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml'
        },
        body: body
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(await response.text(), 'text/xml');

    try {
        return xmlDoc.getElementsByTagName('success')[0].childNodes[0].nodeValue === 'true';
    } catch (err) {
        return false;
    }
}

async function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;   //treba zahashovat

    const errorElement = document.querySelector('#error-message');
    if (!await validateEmail(email)) {
        errorElement.innerHTML = 'E-mail nie je validny';
        return;
    } else {
        errorElement.innerHTML = '';
    }

    const data = {email, password};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  //data odosielane v requeste
    };

    const response = await fetch('/api/login', options)
    const json = await response.json();

    // treba rozlisit userov
    if(json.status == 'success') {
        activ_user = json.body;
        
        localStorage.setItem('user_id', activ_user.id);
        activ_user.user_type == 'zamestnanec' ? document.location.href = '/html/employee.html' : document.location.href = '/html/client.html';
    }
}