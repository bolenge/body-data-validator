const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./index');

const app = express();

app.use(bodyParser.json());
app.use(validator.init);

app.post('/api/users/create', (req, res, next) => {
    let rules = {
        name: "int|min:100"
    }
    req.body.verify(rules, (valid, errors) => {
        if (valid) {
            return res.status(200).json({
                message: "Coolll !!"
            })
        }

        res.status(400).json(errors);
    })
})

app.listen(3000)