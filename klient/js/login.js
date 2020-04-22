async function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;   //treba zahashovat

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
        console.log(activ_user);
        changed_insurances = json.insurances;
        document.location.href = '/html/employee.html'
    }
}