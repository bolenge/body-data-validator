const mbnumber = require('mbnumber');
const emailValidator = require('email-validator');
const {is_tel} = require('./helpers');

/**
 * Allows verification of data validation
 */
let Validator = {
	errors: {},
	req: null,
	res: null,

	twoDotesRegex: /:/,

	constructor() {
		this.errors = {}
		this.twoDotesRegex = /:/
    },
    
    /**
     * Initializing the validator
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @param {Function} next 
     */
    init(req, res, next) {
        if (req.body.verify === undefined) {
            let datas = req.body;
            const $this = Validator;
            req.body.verify = (rules, callback) => {
                $this.verify(req.body, rules, callback);
            }
        }

        next();
    },

	/**
	 * Check if the data is valid against the rules put
   * @param {Object} datas The input data to verify
	 * @param {Object} rules Verification rules
	 * @param {Function(success, errors)} callback The callback function to call
	 */
	verify(datas, rules, callback) {
		let donnees = {}

		for (let field in rules) {
			donnees[field] = {value: datas[field] != undefined ? datas[field] : '', rules: rules[field]}
		}

		this.parser(donnees, callback)
	},

	/**
	 * Allows parsing of sent data
	 * @param {Array} datas The data to be parsed
	 */
	parser(datas, callback) {
		for (let key in datas) {
			let field = key
			let value = datas[field]
			let fieldValue = value.value
			let fieldRules = value.rules

			if (fieldRules) {

				var field_front_regex = /(field:.+)/g,
					field_matched = field_front_regex.exec(fieldRules),
					mached = null, 
					field_front = null;

				if (field_matched) {
				  	mached = field_matched[1];
				  	mached = mached.split('|');

					var mached_rules = mached[0];

					field_front = mached_rules.split(':')[1];
					fieldRules = fieldRules.replace(mached_rules, '');
				}

				let rules = fieldRules.split('|');
				let isRequired = rules.indexOf('required');

				rules.forEach((rule, index, tab) => {
					if (rule) {

						let ruleTab = rule.split(':');

						if (isRequired >= 0 || fieldValue) {
							fieldValue = fieldValue.toString();

							if (ruleTab.length > 1) {
								let regle = ruleTab[0];
								let param = ruleTab[1];

								this[regle](field, fieldValue, param, field_front);
							}else {
								this[ruleTab[0]](field, fieldValue, field_front);
							}
						}
					}
				})
			}
		}

		if (this.isValid()) {
			callback(true, null)
		}else {
			callback(false, this.errors)
		}

		this.errors = {}
	},

	/**
	 * Check if the field is required
	 * @param {String} field The field name
	 * @param {String} value Field value
	 * @return bool
	 */
	required(field, value, field_front = null) {
		value = value.trim();

		if (value.length <= 0) {
			this.addError(field, "is required", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Check if the number of characters is equal to the maximum requested
	 * @param {String} field Field name
	 * @param {String} value Field value
	 * @param {Number} maxVal The maximum value that the field must have
	 * @return bool
	 */
	max(field, value, maxVal, field_front = null) {
		value = value.trim();

		if (value.length > maxVal) {
			let error = "maximum " + maxVal + " character" + this.make2Pluriel(maxVal)

			this.addError(field, error, field_front);
			
			return false;
		}

		return true;
	},

	/**
	 * Check if the number of characters is equal to the minimum requested
	 * @param {String} field Field name
	 * @param {String} value Field value
	 * @param {Number} minVal The minimum value that the field must have
	 * @param {String} field_front The minimum value that the field must have
	 * @return bool
	 */
	min(field, value, minVal, field_front = null) {
		value = value.trim()

		if (value.length < minVal) {
			let error = "minimum " + minVal + " character" + this.make2Pluriel(minVal)
			
			this.addError(field, error, field_front);

			return false;
		}

		return true;
	},

	/**
	 * Checks if the field is an integer
	 * @param {String} field Field name
	 * @param {String} value Field value
	 * @param {String} field_front
	 * @return bool
	 */
	int(field, value, field_front = null) {
		value = value.toString()
		value = value.trim()

		if (!mbnumber.isIntValid(value)) {
			this.addError(field, "must be an integer", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Checks if the field value is alphanumeric
	 * @param {String} field Field name
	 * @param {any} value Field value
	 * @param {Number} length The number of characters required
	 */
	alpha(field, value, length = null, field_front = null) {
		value = value.toString()
		value = value.trim()

		length = parseInt(length);
		error = '';

		if (mbnumber.isIntValid(value)) {
			error = "must be alphanumeric";
		}

		if (length) {
			if (value.length != length) {
				error += error ? ' and to have ' : 'must have ';
				error += length+' character'+this.make2Pluriel(length);
			}
		}

		if (error) {
			this.addError(field, error, field_front);
		}
	},

	/**
	 * Check if this is a valid email address
	 * @param {String} field Field name
	 * @param {String} value Field value
	 * @return {Boolean}
	 */
	email(field, value, field_front = null) {
		if (!emailValidator.validate(value)) {
			this.addError(field, "must be a valid email address", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Checks if the value is a valid phone number
	 * @param {String} field Field name
	 * @param {String} value Field value
	 * @return {Boolean}
	 */
	tel(field, value, field_front = null) {
		if (!is_tel(value)) {
			this.addError(field, "must be a valid phone number", field_front);

			return false;
		}

		return true
	},

	/**
	 * Allows to return an 's' if the value passed is > 1
	 * @param {Number} val
	 * @return {String}
	 */
	make2Pluriel(val) {
		return val > 1 ? 's' : ''
	},

	/**
	 * Allows you to add an error
	 * @param {String} field The field with the error
	 * @param {String} error The error to add
	 * @return {void}
	 */
	addError(field, error, field_front = null) {
		field_front = field_front || field;
		
		this.errors[field] = this.errors[field] 
						   ? this.errors[field] + ', ' + error 
						   : field_front  + ' ' + error
	},

	/**
	 * Checks if the data to be checked is valid
	 * @return {Boolean}
	 */
	isValid(callback) {
		if (Object.keys(this.errors).length == 0) {
			return true
		}

		return false
	}
}

module.exports = Validator;