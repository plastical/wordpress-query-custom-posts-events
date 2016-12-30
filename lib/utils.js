'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNormalizedEventsQuery = getNormalizedEventsQuery;
exports.getSerializedEventsQuery = getSerializedEventsQuery;

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_EVENTS_QUERY = {
  _embed: true,
  number: 10,
  offset: 0,
  order_by: 'meta_value',
  type: 'events',
  order: 'ASC',
  fields: 'all_with_meta'
};

/**
 * Returns a normalized events query, excluding any values which match the
 * default event query.
 *
 * @param  {Object} query Events query
 * @return {Object}       Normalized events query
 */
/**
 * External dependencies
 */
function getNormalizedEventsQuery(query) {
  return (0, _omitBy2.default)(query, function (value, key) {
    return DEFAULT_EVENTS_QUERY[key] === value;
  });
}

/**
 * Returns a serialized events query, used as the key in the
 * `state.events.queries` state object.
 *
 * @param  {Object} query  Events query
 * @return {String}        Serialized events query
 */
function getSerializedEventsQuery() {
  var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var normalizedQuery = getNormalizedEventsQuery(query);
  return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}