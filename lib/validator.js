const mbnumber = require('mbnumber');
const mbregex = require('mbregex');
const emailValidator = require('email-validator');
const {is_tel} = require('./helpers');

/**
 * Permet de faire de vérification sur la validation des données
 */
let Validator = {
    errors: {},

    twoDotesRegex: /:/,

	constructor() {
		this.errors = {}
		this.twoDotesRegex = /:/
	},

	/**
	 * Vérifier si les données sont valides par rapport aux règles mises
	 * @param {Object} datas Les données à vérifier
	 * @param {Object} rules Les règles de vérification
	 * @param {Function(success, errors)} callback La fonction callback à appeler
	 */
	verify(datas, rules = null, callback) {
		let donnees = datas

		if (rules) {
			let datasValues =  Object.values(datas)

			if (typeof datasValues[0] != 'object') {
				donnees = {}

				for (let field in datas) {
					donnees[field] = rules[field] 
								   ? {value: datas[field], rules: rules[field]}
								   : {value: datas[field]}
				}
			}else {
				throw "The elements values of datas can't be object if the rules paramater exist"
			}
		}

		this.parser(donnees, callback)
	},

	/**
	 * Permet de faire le parsing des données envoyées
	 * @param {Array} datas Les données à parser
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
	},

	/**
	 * Vérifie si le champ n'est pa vide
	 * @param {String} field Le nom du champ en question
	 * @param {String} value La valeur du champ
	 * @return bool
	 */
	required(field, value, field_front = null) {
		value = value.trim();

		if (value.length <= 0) {
			this.addError(field, "champ obligatoire", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Vérifie si le champ est max qu'il faut
	 * @param {String} field Le nom du champ en question
	 * @param {String} value La valeur du champ
	 * @param {Number} maxVal La valeur maximum que doit avoir le champ
	 * @return bool
	 */
	max(field, value, maxVal, field_front = null) {
		value = value.trim();

		if (value.length > maxVal) {
			let error = "maximum " + maxVal + " caractère" + this.make2Pluriel(maxVal)

			this.addError(field, error, field_front);
			
			return false;
		}

		return true;
	},

	/**
	 * Vérifie si le champ est max qu'il faut
	 * @param {String} field Le nom du champ en question
	 * @param {String} value La valeur du champ
	 * @param {Number} minVal La valeur maximum que doit avoir le champ
	 * @return bool
	 */
	min(field, value, minVal, field_front = null) {
		value = value.trim()

		if (value.length < minVal) {
			let error = "minimum " + minVal + " caractère" + this.make2Pluriel(minVal)
			
			this.addError(field, error, field_front);

			return false;
		}

		return true;
	},

	/**
	 * Vérifie si le champ est max qu'il faut
	 * @param {String} field Le nom du champ en question
	 * @param {String} value La valeur du champ
	 * @param {Number} minVal La valeur maximum que doit avoir le champ
	 * @return bool
	 */
	int(field, value, field_front = null) {
		value = value.toString()
		value = value.trim()

		if (!mbnumber.isIntValid(value)) {
			this.addError(field, "doit être un entier", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Vérifie si la valeur du champ est alphanumérique
	 * @param {String} field Le champ en question
	 * @param {any} value La valeur du champ
	 * @param {Number} length Le nombre de carctère exigé
	 */
	alpha(field, value, length = null, field_front = null) {
		value = value.toString()
		value = value.trim()

		length = parseInt(length);
		error = '';

		if (mbnumber.isIntValid(value)) {
			error = "doit être alphanumérique";
		}

		if (length) {
			if (value.length != length) {
				error += error ? ' et avoir ' : 'doit avoir ';
				error += length+' caractère'+this.make2Pluriel(length);
			}
		}

		if (error) {
			this.addError(field, error, field_front);
		}
	},

	/**
	 * Vérifie si c'est une adresse email valide
	 * @param {String} field Le champ à vérifier
	 * @param {String} value La valeur du champ
	 * @return {Boolean}
	 */
	email(field, value, field_front = null) {
		if (!emailValidator.validate(value)) {
			this.addError(field, "doit être une adresse email valide", field_front);

			return false;
		}

		return true;
	},

	/**
	 * Vérifie si la valeur passée en paramètre est un numéro de téléphone valide
	 * @param {String} field Le champ à vérifier
	 * @param {String} value La valeur du champ
	 * @return {Boolean}
	 */
	tel(field, value, field_front = null) {
		if (!is_tel(value)) {
			this.addError(field, "doit être un numéro de téléphone valide", field_front);

			return false;
		}

		return true
	},

	/**
	 * Permet de renvoyé un 's' si la valeur passé est > 1
	 * @param {Number} val
	 * @return {String}
	 */
	make2Pluriel(val) {
		return val > 1 ? 's' : ''
	},

	/**
	 * Permet d'ajouter une erreur
	 * @param {String} field Le champ ayant l'erreur
	 * @param {String} error L'erreur à ajouter
	 * @return {void}
	 */
	addError(field, error, field_front = null) {
		field_front = field_front || field;
		
		this.errors[field] = this.errors[field] 
						   ? this.errors[field] + ', ' + error 
						   : field_front  + ' ' + error
	},

	/**
	 * Vérifie si les données à vérifier sont valides
	 * @return {Boolean}
	 */
	isValid(callback) {
		if (Object.keys(this.errors).length == 0) {
			return true
		}

		return false
	}
}

module.exports = Validator