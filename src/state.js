/*global SiteSettings */
/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import reduce from 'lodash/reduce';
import qs from 'qs';
import API from 'wordpress-rest-api-oauth-1';
const api = new API({
	url: SiteSettings.endpoint
});

import {
	getSerializedUsersQuery
} from './utils';

/**
 * User actions
 */
export const USER_REQUEST = 'wordpress-redux/user/REQUEST';
export const USER_REQUEST_SUCCESS = 'wordpress-redux/user/REQUEST_SUCCESS';
export const USER_REQUEST_FAILURE = 'wordpress-redux/user/REQUEST_FAILURE';
export const USERS_RECEIVE = 'wordpress-redux/users/RECEIVE';
export const USERS_REQUEST = 'wordpress-redux/users/REQUEST';
export const USERS_REQUEST_SUCCESS = 'wordpress-redux/users/REQUEST_SUCCESS';
export const USERS_REQUEST_FAILURE = 'wordpress-redux/users/REQUEST_FAILURE';

/**
 * Tracks all known users, indexed by user global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items(state = {}, action) {
	switch (action.type) {
		case USERS_RECEIVE:
			const users = keyBy(action.users, 'id');
			return Object.assign({}, state, users);
		default:
			return state;
	}
}

/**
 * Returns the updated user requests state after an action has been
 * dispatched. The state reflects a mapping of user ID to a
 * boolean reflecting whether a request for the user is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requests(state = {}, action) {
	switch (action.type) {
		case USER_REQUEST:
		case USER_REQUEST_SUCCESS:
		case USER_REQUEST_FAILURE:
			return Object.assign({}, state, { [action.userSlug]: USER_REQUEST === action.type });
		default:
			return state;
	}
}

/**
 * Returns the updated user query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests(state = {}, action) {
	switch (action.type) {
		case USERS_REQUEST:
		case USERS_REQUEST_SUCCESS:
		case USERS_REQUEST_FAILURE:
			const serializedQuery = getSerializedUsersQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: USERS_REQUEST === action.type
			});
		default:
			return state;
	}
}

/**
 * Tracks the page length for a given query.
 * @todo Bring in the "without paged" util, to reduce duplication
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function totalPages(state = {}, action) {
	switch (action.type) {
		case USERS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedUsersQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.totalPages
			});      
		default:
			return state;
	}
}

/**
 * Returns the updated user query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of user
 * global IDs for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries(state = {}, action) {
	switch (action.type) {
		case USERS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedUsersQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.users.map((user) => user.id)
			});
		default:
			return state;
	}
}

/**
 * Tracks the slug->ID mapping for users
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function slugs(state = {}, action) {
	switch (action.type) {
		case USER_REQUEST_SUCCESS:
			return Object.assign({}, state, {
				[action.userSlug]: action.userId
			});
		case USERS_RECEIVE:
			const users = reduce(action.users, (memo, u) => {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, users);
		default:
			return state;
	}
}

export default combineReducers({
	items,
	requests,
	totalPages,
	queryRequests,
	queries,
	slugs
});

/**
 * Triggers a network request to fetch users for the specified site and query.
 *
 * @param  {String}   query  User query
 * @return {Function}        Action thunk
 */
export function requestUsers(query = {}) {
	return (dispatch) => {
		dispatch({
			type: USERS_REQUEST,
			query
		});

		query._embed = true;

		api.get('/wp/v2/users', query).then(users => {
			dispatch({
				type: USERS_RECEIVE,
				users
			});
			requestPageCount('/wp/v2/users', query).then(count => {
				dispatch({
					type: USERS_REQUEST_SUCCESS,
					query,
					totalPages: count,
					users
				});
			} );
			return null;
		}).catch((error) => {
			dispatch({
				type: USERS_REQUEST_FAILURE,
				query,
				error
			});
		});
	};
}

/**
 * Triggers a network request to fetch a specific user from a site.
 *
 * @param  {string}   userSlug  User slug
 * @return {Function}           Action thunk
 */
export function requestUser(userSlug) {
	return (dispatch) => {
		dispatch({
			type: USER_REQUEST,
			userSlug
		});

		const query = {
			slug: userSlug,
			_embed: true,
		};

		api.get('/wp/v2/users', query).then(data => {
			const user = data[0];
			dispatch({
				type: USERS_RECEIVE,
				users: [user]
			});
			dispatch({
				type: USER_REQUEST_SUCCESS,
				userId: user.id,
				userSlug
			});
			return null;
		}).catch((error) => {
			dispatch({
				type: USER_REQUEST_FAILURE,
				userSlug,
				error
			});
		});
	};
}

function requestPageCount(url, data = null) {
	if (url.indexOf('http') !== 0) {
		url = `${api.config.url}wp-json${url}`
	}

	if (data) {
		// must be decoded before being passed to ouath
		url += `?${decodeURIComponent(qs.stringify(data))}`;
		data = null
	}

	const headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	};

	return fetch(url, {
		method: 'HEAD',
		headers: headers,
		mode: 'cors',
		body: null
	})
	.then(response => {
		return parseInt(response.headers.get('X-WP-TotalPages'), 10) || 1;
	});
}
