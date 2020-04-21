
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
    
    if(json.status == 'success') {
        document.location.href = '/html/jano.html'
    }
}