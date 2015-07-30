// ### Errors
// the error will come up
var util = require('util');

/**
 * # Config option error
 * @param message (String) error message
 * @param [constr]
 * @constructor
 */
function ConfigOptionsError(message, constr) {
    constr = constr || {};
    Error.captureStackTrace(this, constr || this);
    this.message = message;
}

util.inherits(ConfigOptionsError, Error);
ConfigOptionsError.prototype.name = 'ConfigOptionsError';

/**
 * # database error
 * @param message (String) error message
 * @param [constr]
 * @constructor
 */
function DatabaseError(message, constr) {
    constr = constr || {};
    Error.captureStackTrace(this, constr || this);
    this.message = message;
}

util.inherits(DatabaseError, Error);
DatabaseError.prototype.name = 'DatabaseError';

/**
 * # producer error
 * @param message (String) error message
 * @param [constr]
 * @constructor
 */
function ProducerError(message, constr) {
    constr = constr || {};
    Error.captureStackTrace(this, constr || this);
    this.message = message;
}

util.inherits(ProducerError, Error);
ProducerError.prototype.name = 'ProducerError';

/**
 * # consumer error
 * @param message (String) error message
 * @param [constr]
 * @constructor
 */
function ConsumerError(message, constr) {
    constr = constr || {};
    Error.captureStackTrace(this, constr || this);
    this.message = message;
}

util.inherits(ConsumerError, Error);
ConsumerError.prototype.name = 'ConsumerError';

module.exports = {
    ConfigOptionsError: ConfigOptionsError,
    DatabaseError: DatabaseError,
    ProducerError: ProducerError,
    ConsumerError: ConsumerError
};