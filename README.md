## body-data-validator

It is a JavaScript module (NodeJS) managing data validation

### Installation

This is a [Node.js] (https://nodejs.org/en/) module available at [npm registry] (https://www.npmjs.com/).

```bash
$ npm install body-data-validator
```

### API

Once you have it installed, you should now call the initialization middleware.
In case you are using [Express] (https://www.npmjs.com/package/express) you can insert it as below:

```js
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('body-data-validator');

const app = express();

app.use(bodyParser.json());
// From here
app.use(validator.init);

app.post('/api/users/create', (req, res, next) => {
    // 
})

app.listen(3000)
```

After adding the initialization middleware, the `validator` adds to the req.body object a method called `verify` (`req.body.verify`) which receives two parameters.

```js
let rules = {
	name: 'required|min:3|max:30',
	firstname: 'min:3|max:30',
	email: 'required|email'
}

req.body.verify(rules, (valid, errors) => {
	if (valid) {
		console.log("Ok")
	}else {
		console.log(errors)
	}
})
```

#### validator.verify (rules, callback)

This method is the one which launches all the monoworks, it receives 2 parameters:

1. `rules` the rules on the data elements to check for validity.
2. `callback (valid, errorrs)` The second parameter is the callback function to be called, which in return receives two parameters.
* `valid`: Equals` true` if everything is correct and there is no error and `false` otherwise
* `errors`: Object, containing the list of errors whose key name is the name of the data and the value is the error message (`errors.name`)

#### The available rules

* `required`: The field is required, mandatory
* `email`: The value of the field must be a valid email address
* `min: n`:` n` represents the minimum number of characters this field must have
* `max: n`:` n` represents the maximum number of characters this field must have
* `int`: The value of chmap must be an integer
* `alpha: n`: The value of the chmap must be a string` n` (optional) represents the number of characters this field must have
* `tel`: The value of the field must be a valid phone number

> Note: In case you need to ensure that the name of the field to display the message to the user is not that of the sent data field, you can specify this name by adding the rule `field: Name to display`.

Example
```js
let rules = {
	name: 'field:Nom|required|min:3|max:30',
	firstname: 'min:3|field:Prénom|max:30|alpha',
	email: 'required|email|field:Adresse email'
}

req.body.verify(rules, (valid, errors) => {
	if (valid) {
		console.log("Ok")
	}else {
		console.log(errors)
	}
})
```

### Features

Features to be added in future versions:

* i18n (internationalization or use of several languages for error messages)

[@bolenge](https://github.com/bolenge)