require('dotenv').config();

const {Pool, Client} = require('pg'); //databaza
const async = require('async');
const express = require('express');
const app = express();
const soap = require('soap');
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

app.set('view engine', 'ejs');
app.listen(3000, () => console.log('server listening at port 3000'));
app.use(express.static('../klient'));
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pis',
    password: process.env.DB_PASS || 'vava2020',   //HESLO TREBA ZMENIT PODLA TOHO AKE MAS TY NASTAVENE INAK TO NEPOJDE
    port: 5432,
    connectionTimeoutMillis: 5000
});

function notify(email, subject, message) {
    const url = 'http://pis.predmety.fiit.stuba.sk/pis/ws/NotificationServices/Email?WSDL'
    const args = {
        team_id: '062',
        password: '88JMQ1',
        email: email,
        subject: subject,
        message: message
    }
    soap.createClient(url, function(err, client) {
        client.notify(args, function(err, result) {
            console.log(`SOAP result: ${result}`);
        });
    });
}

function hashData(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

//---------------POUZIVATEL---------------------------
//prihlasenie pouzivatela
app.post('/api/login', (request, response) => {
    const {email, password} = request.body;

    const hash = hashData(password);

    const query = `select * from users where email = $1 and password = $2`;
    const values = [email, hash];

    pool.query(query, values, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            if(res.rows[0]) {
                response.json({
                    status: 'success',
                    body: res.rows[0],
                });

            } else {
                response.json({
                    status: 'fail',
                    body: undefined
                });
            }
        }
    });
});

app.post('/api/reset_password', (request, response) => {
    const {email} = request.body;
    const token = uuidv4().replace(/-/g, "");

    pool.query("update users set reset_token = $1 where email = $2", [token, email], (err, res) => {
        if (err) {
            console.error(err);
        } else if (res.rowCount === 0) {
            console.log(`User with e-mail ${email} not found!`);
            response.status(404);
            response.json({
                status: 'fail',
                body: 'Užívateľ nebol nájdeny!'
            });
        } else {
            const resetLink = `http://${request.headers.host}/password/reset/${token}`;
            notify(email, 'Resetovanie hesla', `Pre resetovanie hesla kliknite na tento odkaz: ${resetLink}`);

            console.log(`Reset token generated for ${email} (${token})`);
            response.json({
                status: 'success',
                body: undefined
            });
        }
    });
});

app.get('/password/reset/:token', (request, response) => {
    const token = request.params.token;
    pool.query("select * from users where reset_token = $1", [token], (err, res) => {
        if (err) {
            console.error(err);
        } else {
            if (res.rows[0]) {
                const userId = res.rows[0].id;
                const newPassword = Math.random().toString(36).slice(2);
                const newPasswordHash = hashData(newPassword);
                pool.query("update users set password = $1 where id = $2", [newPasswordHash, userId], (err, res) => {
                    if (err) {
                        console.error(err);
                    } else if (res.rowCount === 0) {
                        response.render('index', {
                            success: false,
                            message: "Nesprávny token.",
                        });
                    } else {
                        pool.query("update users set reset_token = NULL where id = $1", [userId], (err, res) => {
                            if (err) {
                                console.error(err);
                            } else if (res.rowCount === 0) {
                                response.render('index', {
                                    success: false,
                                    message: "Nastala chyba pri vymazávaní tokenu.",
                                });
                            }
                        })

                        response.render('index', {
                            success: true,
                            message: "Nové heslo bolo úspešne vygenerovné.",
                            password: newPassword
                        });
                    }
                });
            } else {
                response.render('index', {
                    success: false,
                    message: "Nesprávny token",
                    password: undefined
                });
            }
        }
    });
});

//vracia pouzivatela na zaklade id
app.get('/api/user/:id', (request, response) => {
    const query = `select * from users where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});

//----------------------ZMENENE POISTKY---------------------
//vrati vsetky zmenene poistky so statusom neskontolovana
app.get('/api/all_changed_insurances', (request, response) => {
    const query = 'select * from changed_insurance where state = \'neskontrolovana\'';

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows
            });
        }
    });
});

//vrati zmenenu poistku podla ID
app.get('/api/get_changed_insurance/:id', (request, response) => {
    const query = `select * from changed_insurance where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});

//upravi zmenenu poistku a nastavi spravu a stav
app.post('/api/update_change_insurance/', (request, response) => {
    let data = request.body;
    const query = `UPDATE changed_insurance SET message = \'${data.message}\', state = \'${data.state}\' WHERE id = ${data.changed_insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: "ok"
            })
        }
    });
});

//upravi cenu zmenenu poistku
app.post('/api/update_change_insurance_price/', (request, response) => {
    let data = request.body;
    const query = `UPDATE changed_insurance SET price = ${data.price} WHERE id = ${data.changed_insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: "ok"
            })
        }
    });
});

//vlozi do databazy zmenenu poistku
app.post('/api/changed_insurance/', (request, response) => {
    let data = request.body;
    const query = `INSERT INTO changed_insurance (insurance_id, state, message, price, discount) VALUES (${data.insurance_id}, '${data.state}', ${data.message}, ${data.price}, ${data.discount}) returning id`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0].id    //vrati id vlozenej poistky
            })
        }
    });
});

//--------------------POISTKY---------------------------------
//vrati vsetky poistky patriace prihlasenemu poistencovi
app.get('/api/insurance/user/:id', (request, response) => {
    const query = `select * from insurance where user_id = ${request.params.id}`

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows
            });
        }
    });
});

//vrati originalnu poistku podla jej id
app.get('/api/insurance/:id', (request, response) => {
    const query = `select * from insurance where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});

app.post('/api/end_insurance/', (request, response) => {
    let data = request.body;
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    const query = `UPDATE insurance SET insurance_end_date = \'${date}\' WHERE id = ${data.insurance_id}`

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: 'ok'
            })
        }
    });
});

app.post('/api/new_insurance/', (request, response) => {
    let data = request.body;
    const query = `INSERT INTO insurance (vehicle_id, user_id, insurance_number, created_at, insurance_end_date, price, discount) VALUES (${data.insurance.vehicle_id}, ${data.insurance.user_id}, '${data.insurance.insurance_number}', '${data.insurance.created_at}', '${data.insurance.insurance_end_date}', ${data.changed_insurance.price}, ${data.changed_insurance.discount}) returning id`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0].id
            })
        }
    });
});

//----------------------------ZMENENE BALIKY-----------------------------
//vracia vsetky baliky zahrnute v zmenenej zmluve
app.get('/api/all_changed_packages/:id', (request, response) => {
    const query = `select * from changed_insurance_packages where changed_insurance_id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows
            });
        }
    });
});

//vymaze baliky zmenenej poistky
app.delete('/api/remove_changed_packages/', (request, response) => {
    let data = request.body;
    const query = `delete from changed_insurance_packages where changed_insurance_id = ${data.changed_insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: "ok"
            })
        }
    });
});

//vlozi baliky zmenenej poistky
app.post('/api/insert_changed_packages/', (request, response) => {
    let data = request.body;
    const query = `INSERT INTO changed_insurance_packages (changed_insurance_id, package_id) VALUES (${data.changed_insurance_id}, ${data.package_id});`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: "ok"
            })
        }
    });
});

//----------------------BALIKY-----------------------------
//vracia len tie baliky, ktore su zahrnute v zmenenych balikoch
app.get('/api/package/:id', (request, response) => {
    const query = `select * from product_packages where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});

//vracia vsetky baliky
app.get('/api/package_all', (request, response) => {
    const query = `select * from product_packages`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows
            });
        }
    });
});

//vracia vsetky baliky patriace ku konkretnej poistke
app.get('/api/packages/:insurance_id', (request, response) => {
    const query = `select * from insurance_packages where insurance_id = ${request.params.insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows
            });
        }
    });
});

//vracia balik na zaklade jeho id
app.get('/api/package/:id', (request, response) => {
    const query = `select * from product_packages where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});

//vlozi balik prijatej poistky
app.post('/api/insert_packages/', (request, response) => {
    let data = request.body;
    const query = `INSERT INTO insurance_packages (insurance_id, package_id) VALUES (${data.new_id}, ${data.package_id});`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: "ok"
            })
        }
    });
});

//----------------------VOZIDLO-----------------------------

//vracia vozidlo na zaklade jeho id
app.get('/api/vehicle/:id', (request, response) => {
    const query = `select * from vehicle where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            response.json({
                body: res.rows[0]
            });
        }
    });
});
