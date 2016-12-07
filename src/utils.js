/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';

const DEFAULT_USERS_QUERY = {
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
export function getNormalizedUsersQuery(query) {
	return omitBy(query, (value, key) => DEFAULT_USERS_QUERY[key] === value);
}

/**
 * Returns a serialized users query, used as the key in the
 * `state.users.queries` state object.
 *
 * @param  {Object} query  Users query
 * @return {String}        Serialized users query
 */
export function getSerializedUsersQuery(query = {}) {
	const normalizedQuery = getNormalizedUsersQuery(query);
	return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}
