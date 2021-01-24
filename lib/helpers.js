/**
 * Vérifie si la valeur passée est un numéro de téléphone
 * @param {any} tel La valeur en question
 * @return {Boolean}
 */
exports.is_tel = (tel) => {
    if (tel.length <= 15) {
        if (/^\+([1-9]){1}([0-9]){11,}/.test(tel)) {
            return true
        }

        if (tel.length === 10) {
            if (/^0([1-9]){1}([0-9]){8}/.test(tel)) {
                return true;
            }
        }
    }

    return false
}