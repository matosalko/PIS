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
let insurance;
let activ_user;
let user;
let changed_packages;
let packages;

let selected_insurance;

//prihladenie pouzivatela
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
                    insurances: changed_insurance
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

//vracia aktualne prihlaseneho pouzivatela
app.get('/api/user', (request, response) => {
    console.log(activ_user);
    response.json({
        body: activ_user
    });
});

//vracia vsetky zmenene poistky
app.get('/api/changed_insurance', (request, response) => {
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

//vracia poistku podla jej id
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

//vracia poistku podla jej id
app.get('/api/selected_insurance/:id', (request, response) => {
    selected_insurance_id = request.params.id;
});

//vracia vsetky zmenene baliky
app.get('/api/changed_packages', (request, response) => {
    console.log(selected_insurance_id)
    let query = `select * from changed_insurance_packages where changed_insurance_id = ${selected_insurance_id}`;

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

//vracia baliky, ktore su zahrnute v zmenenych balikoch
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

//vracia id zmenenej poistky
app.get('/api/selected_insurance', (request, response) => {
    response.json({
        body: selected_insurance_id
    });
});

//vracia baliky, ktore su zahrnute v zmenenych balikoch
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