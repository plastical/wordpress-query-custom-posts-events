'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNormalizedUsersQuery = getNormalizedUsersQuery;
exports.getSerializedUsersQuery = getSerializedUsersQuery;

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_USERS_QUERY = {
  number: 10,
  offset: 0,
  role: 'Subscriber',
  order_by: 'display_name',
  order: 'ASC',
  fields: 'all_with_meta'
};

/**
 * Returns a normalized users query, excluding any values which match the
 * default user query.
 *
 * @param  {Object} query Users query
 * @return {Object}       Normalized users query
 */
/**
 * External dependencies
 */
function getNormalizedUsersQuery(query) {
  return (0, _omitBy2.default)(query, function (value, key) {
    return DEFAULT_USERS_QUERY[key] === value;
  });
}

/**
 * Returns a serialized users query, used as the key in the
 * `state.users.queries` state object.
 *
 * @param  {Object} query  Users query
 * @return {String}        Serialized users query
 */
function getSerializedUsersQuery() {
  var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var normalizedQuery = getNormalizedUsersQuery(query);
  return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}