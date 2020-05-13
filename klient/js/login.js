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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!await validateEmail(email)) {
        if (!document.querySelector('#email').classList.contains('invalid')) {
            document.querySelector('#email').classList.add('invalid');
        }

        let helperText = document.querySelector('#email-helper-text');
        if (!helperText) {
            helperText = document.createElement('span')
            helperText.classList.add('helper-text');
            helperText.id = 'email-helper-text';
            helperText.setAttribute('data-error', 'Nesprávny e-mail');
            document.querySelector('#email-input').appendChild(helperText);
        }
        return;
    } else {
        if (document.querySelector('#email').classList.contains('invalid')) {
            document.querySelector('#email').classList.remove('invalid');
        }
        const helperText = document.querySelector('#email-helper-text');
        if (helperText) {
            helperText.remove();
        }
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
    if (json.status === 'success') {
        activ_user = json.body;
        
        localStorage.setItem('user_id', activ_user.id);
        activ_user.user_type === 'zamestnanec' ? document.location.href = '/html/employee.html' : document.location.href = '/html/user_insurances.html';
    } else {
        M.toast({html: 'Nepodarilo sa prihlásiť, skontrolujte e-mail a heslo!', displayLength: 6000})
    }
}

async function resetPassword() {
    const email = document.getElementById('email').value;

    if (!await validateEmail(email)) {
        if (!document.querySelector('#email').classList.contains('invalid')) {
            document.querySelector('#email').classList.add('invalid');
        }

        let helperText = document.querySelector('#email-helper-text');
        if (!helperText) {
            helperText = document.createElement('span')
            helperText.classList.add('helper-text');
            helperText.id = 'email-helper-text';
            helperText.setAttribute('data-error', 'Nesprávny e-mail');
            document.querySelector('#email-input').appendChild(helperText);
        }
        return;
    } else {
        if (document.querySelector('#email').classList.contains('invalid')) {
            document.querySelector('#email').classList.remove('invalid');
        }
        const helperText = document.querySelector('#email-helper-text');
        if (helperText) {
            helperText.remove();
        }
    }

    const data = {email};
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  //data odosielane v requeste
    };

    const response = await fetch('/api/reset_password', options)
    const json = await response.json();

    if (json.status === 'success') {
        M.toast({html: 'Heslo bolo úspešne resetované, skontrolujte si svoju e-mailovú schránku', displayLength: Infinity})
    } else {
        M.toast({html: 'Nepodarilo sa resetovať heslo', displayLength: 6000})
    }
}

function goToMainPage() {
    document.location.href = '/index.html';
}

function goToForgottenPassword() {
    document.location.href = '/html/password_reset.html';
}