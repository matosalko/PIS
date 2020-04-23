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
    password: 'mamut9191',
    port: 5432,
})

let changed_insurance;
let changed_insurance_id;

let insurance;
let insurance_id;

let activ_user;
let user;

let changed_packages;
let packages;

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

//vrati vsetky zmenene poistky so statusom neskontolovana
app.get('/api/all_changed_insurances', (request, response) => {
    let query = 'select * from changed_insurance where state = \'neskontrolovana\'';

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            changed_insurance = res.rows;
            response.json({
                body: changed_insurance
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
            insurance = res.rows[0]

            response.json({
                body: insurance
            })
        }
    });
});

//vrati vybratu originalnu poistku podla jej ulozeneho id
app.get('/api/check_insurance', (request, response) => {
    const query = `select * from insurance where id = ${insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            insurance = res.rows[0]

            response.json({
                body: insurance
            })
        }
    });
});

//vracia vsetky baliky zahrnute v zmenenej zmluve
app.get('/api/all_changed_packages', (request, response) => {
    console.log("zmenene baliky");
    console.log("co to " + changed_insurance_id);
    let query = `select * from changed_insurance_packages where changed_insurance_id = ${changed_insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            changed_packages = res.rows;
            response.json({
                body: changed_packages
            });
        }
    });
});

//vracia len tie baliky, ktore su zahrnute v zmenenych balikoch 
app.get('/api/package/:id', (request, response) => {
    let query = `select * from product_packages where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            packages = res.rows[0];
            response.json({
                body: packages
            });
        }
    });
});

//vracia vsetky baliky
app.get('/api/package_all', (request, response) => {
    let query = `select * from product_packages`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            packages = res.rows;
            response.json({
                body: packages
            });
        }
    });
});

//vracia pouzivatela
app.get('/api/user_insurance/:id', (request, response) => {
    let query = `select * from users where id = ${request.params.id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            user = res.rows[0];
            response.json({
                body: user
            });
        }
    });
});

//vrati vybratu zmenenu poistku a ULOZI JU
app.post('/api/set_changed_insurance/', (request, response) => {
    let data = request.body;
    const query = `select * from changed_insurance where id = ${data.changed_insurance_id}`;

    pool.query(query, (err, res) => {
        if(err) {
            console.error(err);
        } else {
            changed_insurance = res.rows[0];
            console.log(changed_insurance);
            response.json({
                body: "ok"
            })
        }
    });
});


//vymaze baliky zmenenej poistky
app.delete('/api/remove_changed_packages/', (request, response) => {
    let data = request.body;
    const query = `delete from changed_insurance_packages where changed_insurance_id = ${data.id}`;

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

//vymaze baliky zmenenej poistky
app.post('/api/insert_changed_packages/', (request, response) => {
    let data = request.body;
    const query = `INSERT INTO changed_insurance_packages (changed_insurance_id, package_id) VALUES (${data.id}, ${data.item});`;

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

//upravi zmenenu poistku a nastavi spravu a stav
app.post('/api/update_change_insurance/', (request, response) => {
    let data = request.body;
    console.log('UPDATE');
    console.log(data);
    console.log(data.message);
    console.log(data.state);
    console.log(data.id);
    const query = `UPDATE changed_insurance SET message = \'${data.message}\', state = \'${data.state}\' WHERE id = ${changed_insurance_id}`;

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


//------------------ulozenie ideciek poistiek
//ulozi id originalnej poistky
app.get('/api/set_insurance/:id', (request, response) => {
    insurance_id = request.params.id;
    console.log("som tu 1 " + insurance_id);
    response.json({
        body: null
    });
});

//ulozi id zmenenej poistky
app.get('/api/set_changed_insurance/:id', (request, response) => {
    changed_insurance_id = request.params.id;
    console.log("som tu 2 " + changed_insurance_id);
    response.json({
        body: null
    });
});

// //upravi zmenenu poistku a nastavi spravu a stav
// app.post('/api/set_message_state/', (request, response) => {
//     let data = request.body;
    
//     message = data.message;
//     state = data.state;

//     console.log('UPDATE');
//     console.log(message);
//     console.log(state);

//     response.json({
//         body: "ok"
//     })
// });



//-----------vracaju nacitane hodnoty------------------------
//vracia id zmenenej poistky
app.get('/api/get_insurance_id', (request, response) => {
    response.json({
        body: insurance_id
    });
});

//vracia usera
app.get('/api/get_user', (request, response) => {
    response.json({
        body: user
    });
});

//vracia poistku
app.get('/api/get_insurance', (request, response) => {
    response.json({
        body: insurance
    });
});

//vracia poistku
app.get('/api/get_changed_insurance', (request, response) => {
    response.json({
        body: changed_insurance
    });
});

//vracia aktualne prihlaseneho pouzivatela
app.get('/api/user', (request, response) => {
    console.log(activ_user);
    response.json({
        body: activ_user
    });
});