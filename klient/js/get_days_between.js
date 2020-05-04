async function get_current_date() {
    //zistenie aktualneho datumu
    let url = 'http://pis.predmety.fiit.stuba.sk/pis/ws/Calendar'
    let xml = 
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/calendar/types">' +
    '<soapenv:Header/>' +
        '<soapenv:Body>' +
            '<typ:getCurrentDate/>' +
        '</soapenv:Body>' +
    '</soapenv:Envelope>'

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml'
        },
        body: xml
    };
    let response = await fetch(url, options);

    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(await response.text(), 'text/xml');
    
    let current_date = xmlDoc.getElementsByTagName('date')[0].childNodes[0].nodeValue;
    return current_date;
}

async function get_days_between(start_date, end_date) {
    //zistenie intervalu (v dnoch) medzi aktualnym datumom a datumom registracie pouzivatela
    let url = 'http://pis.predmety.fiit.stuba.sk/pis/ws/Calendar'
    let xml = 
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/calendar/types">' +
    '<soapenv:Header/>' +
        '<soapenv:Body>' +
        '<typ:convertIntervalToDays>' +
            `<date1>${start_date}</date1>` +
            `<date2>${end_date}</date2>` +
        '</typ:convertIntervalToDays>' +
        '</soapenv:Body>' +
    '</soapenv:Envelope>'

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml'
        },
        body: xml
    };
    let response = await fetch(url, options);
    
    const parser = new DOMParser();
    let xmlDoc = parser.parseFromString(await response.text(), 'text/xml');

    const days_registered = xmlDoc.getElementsByTagName('days')[0].childNodes[0].nodeValue
    return days_registered;
}