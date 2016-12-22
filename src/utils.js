/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';

const DEFAULT_EVENTS_QUERY = {
	number: 10,
	offset: 0,
  role: 'Subscriber',
	order_by: 'meta_value',
  meta_key: 'events_startdate',
  meta_query: {
    key: 'events_enddate',
    compare: '<=',
    value: Date.now(),
  },
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
export function getNormalizedEventsQuery(query) {
	return omitBy(query, (value, key) => DEFAULT_EVENTS_QUERY[key] === value);
}

/**
 * Returns a serialized events query, used as the key in the
 * `state.events.queries` state object.
 *
 * @param  {Object} query  Events query
 * @return {String}        Serialized events query
 */
export function getSerializedEventsQuery(query = {}) {
	const normalizedQuery = getNormalizedEventsQuery(query);
	return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}
