const {Pool, Client} = require('pg'); //databaza
const async = require('async');
const express = require('express'); 
const app = express();
app.listen(3000, () => console.log('server listening at port 3000'));
app.use(express.static('../klient'));
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pis',
    password: 'mamut9191',   //HESLO TREBA ZMENIT PODLA TOHO AKE MAS TY NASTAVENE INAK TO NEPOJDE
    port: 5432,
})

//---------------POUZIVATEL---------------------------
//prihlasenie pouzivatela
app.post('/api/login', (request, response) => {
    const {email, password} = request.body;
    const query = `select * from users where email = $1 and password = $2`;
    const values = [email, password];

    pool.query(query, values, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            console.log(res.rows[0]);

            if(res.rows[0]) {
                activ_user = res.rows[0];
                // skontroluj ci sa jedna o zamestnanca
                if(res.rows[0].user_type == 'zamestnanec'){
                    console.log(res.rows[0].user_type);
                }
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
    console.log(date);

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