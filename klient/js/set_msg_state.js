async function set_msg_state(message, state) {
    console.log("WSDL")

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message, state}) //data odosielane v requeste
    };

    await fetch('/api/update_change_insurance', options);
}

function notify(user, message, state, send_acc_ins) {
    let team_id = "062";
    let password = "88JMQ1";
    let address = user.address;
    let phone = user.phone;
    let email = user.email;
    let subject = "Notifikacia";
    let msg;
    let url;

    if(state == "prijata") {
        msg = `Vasa zmena bola ${state}.`;
    } else {
        msg = `Vasa zmena bola ${state} z nasledujucich dovodov. ${message}`;
    }

    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            xhr.open(method, url, false);
        } else if (typeof XDomainRequest != "undefined") {
            alert
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            console.log("CORS not supported");
            alert("CORS not supported");
            xhr = null;
        }
        return xhr;
    }

    if(user.notification == 'mail' || send_acc_ins) {
        if(send_acc_ins) {
            subject = "Poistka";
            msg = "Toto je vasa nova poistna zmluva.";
        }

        url = "http://pis.predmety.fiit.stuba.sk/pis/ws/NotificationServices/Mail"
        var xml = 
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/notificationservices/mail/types">' +
        '<soapenv:Header/>'+
        '<soapenv:Body>'+
            '<typ:notify>'+
                `<team_id>${team_id}</team_id>`+
                `<password>${password}</password>`+
                `<address>${address}</address>`+
                `<subject>${subject}</subject>`+
                `<message>${msg}</message>`+
            '</typ:notify>'+
        '</soapenv:Body>'+
        '</soapenv:Envelope>';
    }

    if(user.notification == 'email') {
        url = "http://pis.predmety.fiit.stuba.sk/pis/ws/NotificationServices/Email"
        var xml = 
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/notificationservices/email/types">'+
        '<soapenv:Header/>'+
        '<soapenv:Body>'+
        '<typ:notify>'+
            `<team_id>${team_id}</team_id>`+
            `<password>${password}</password>`+
            `<email>${email}</email>`+
            `<subject>${subject}</subject>`+
            `<message>${msg}</message>`+
        '</typ:notify>'+
        '</soapenv:Body>'+
        '</soapenv:Envelope>';
    }

    if(user.notification == 'sms') {
        url = "http://pis.predmety.fiit.stuba.sk/pis/ws/NotificationServices/SMS"
        var xml = 
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/notificationservices/sms/types">'+
        '<soapenv:Header/>'+
        '<soapenv:Body>'+
        '<typ:notify>'+
            `<team_id>${team_id}</team_id>`+
            `<password>${password}</password>`+
            `<phone>${phone}</phone>`+
            `<subject>${subject}</subject>`+
            `<message>${msg}</message>`+
        '</typ:notify>'+
        '</soapenv:Body>'+
        '</soapenv:Envelope>';
    }


    let xhr = createCORSRequest("POST", url);

    console.log(xhr);
    if(!xhr){
        console.log("XHR issue");
        return;
    }

    xhr.onload = function (){
        let results = xhr.responseText;
        console.log(results);
    }

    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send(xml);
}


  