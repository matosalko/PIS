const {Pool, Client} = require('pg'); //databaza

const express = require('express'); 
const app = express();
app.listen(3000, () => console.log('server listening at port 3000'));
app.use(express.static('../klient'));
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pis',
    password: 'vava2020',
    port: 5432,
})

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
                response.json({
                    status: 'success',
                    body: res.rows[0]
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
