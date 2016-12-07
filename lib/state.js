'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.USERS_REQUEST_FAILURE = exports.USERS_REQUEST_SUCCESS = exports.USERS_REQUEST = exports.USERS_RECEIVE = exports.USER_REQUEST_FAILURE = exports.USER_REQUEST_SUCCESS = exports.USER_REQUEST = undefined;
exports.items = items;
exports.requests = requests;
exports.queryRequests = queryRequests;
exports.totalPages = totalPages;
exports.queries = queries;
exports.slugs = slugs;
exports.requestUsers = requestUsers;
exports.requestUser = requestUser;

var _redux = require('redux');

var _keyBy = require('lodash/keyBy');

var _keyBy2 = _interopRequireDefault(_keyBy);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _wordpressRestApiOauth = require('wordpress-rest-api-oauth-1');

var _wordpressRestApiOauth2 = _interopRequireDefault(_wordpressRestApiOauth);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /*global SiteSettings */
/**
 * External dependencies
 */


var api = new _wordpressRestApiOauth2.default({
	url: SiteSettings.endpoint
});

/**
 * User actions
 */
var USER_REQUEST = exports.USER_REQUEST = 'wordpress-redux/user/REQUEST';
var USER_REQUEST_SUCCESS = exports.USER_REQUEST_SUCCESS = 'wordpress-redux/user/REQUEST_SUCCESS';
var USER_REQUEST_FAILURE = exports.USER_REQUEST_FAILURE = 'wordpress-redux/user/REQUEST_FAILURE';
var USERS_RECEIVE = exports.USERS_RECEIVE = 'wordpress-redux/users/RECEIVE';
var USERS_REQUEST = exports.USERS_REQUEST = 'wordpress-redux/users/REQUEST';
var USERS_REQUEST_SUCCESS = exports.USERS_REQUEST_SUCCESS = 'wordpress-redux/users/REQUEST_SUCCESS';
var USERS_REQUEST_FAILURE = exports.USERS_REQUEST_FAILURE = 'wordpress-redux/users/REQUEST_FAILURE';

/**
 * Tracks all known users, indexed by user global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function items() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USERS_RECEIVE:
			var users = (0, _keyBy2.default)(action.users, 'id');
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
function requests() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USER_REQUEST:
		case USER_REQUEST_SUCCESS:
		case USER_REQUEST_FAILURE:
			return Object.assign({}, state, _defineProperty({}, action.userSlug, USER_REQUEST === action.type));
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
function queryRequests() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USERS_REQUEST:
		case USERS_REQUEST_SUCCESS:
		case USERS_REQUEST_FAILURE:
			var serializedQuery = (0, _utils.getSerializedUsersQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, USERS_REQUEST === action.type));
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
function totalPages() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USERS_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedUsersQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.totalPages));
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
function queries() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USERS_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedUsersQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.users.map(function (user) {
				return user.id;
			})));
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
function slugs() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case USER_REQUEST_SUCCESS:
			return Object.assign({}, state, _defineProperty({}, action.userSlug, action.userId));
		case USERS_RECEIVE:
			var users = (0, _reduce2.default)(action.users, function (memo, u) {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, users);
		default:
			return state;
	}
}

exports.default = (0, _redux.combineReducers)({
	items: items,
	requests: requests,
	totalPages: totalPages,
	queryRequests: queryRequests,
	queries: queries,
	slugs: slugs
});

/**
 * Triggers a network request to fetch users for the specified site and query.
 *
 * @param  {String}   query  User query
 * @return {Function}        Action thunk
 */

function requestUsers() {
	var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return function (dispatch) {
		dispatch({
			type: USERS_REQUEST,
			query: query
		});

		query._embed = true;

		api.get('/wp/v2/users', query).then(function (users) {
			dispatch({
				type: USERS_RECEIVE,
				users: users
			});
			requestPageCount('/wp/v2/users', query).then(function (count) {
				dispatch({
					type: USERS_REQUEST_SUCCESS,
					query: query,
					totalPages: count,
					users: users
				});
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: USERS_REQUEST_FAILURE,
				query: query,
				error: error
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
function requestUser(userSlug) {
	return function (dispatch) {
		dispatch({
			type: USER_REQUEST,
			userSlug: userSlug
		});

		var query = {
			slug: userSlug,
			_embed: true
		};

		api.get('/wp/v2/users', query).then(function (data) {
			var user = data[0];
			dispatch({
				type: USERS_RECEIVE,
				users: [user]
			});
			dispatch({
				type: USER_REQUEST_SUCCESS,
				userId: user.id,
				userSlug: userSlug
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: USER_REQUEST_FAILURE,
				userSlug: userSlug,
				error: error
			});
		});
	};
}

function requestPageCount(url) {
	var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	if (url.indexOf('http') !== 0) {
		url = api.config.url + 'wp-json' + url;
	}

	if (data) {
		// must be decoded before being passed to ouath
		url += '?' + decodeURIComponent(_qs2.default.stringify(data));
		data = null;
	}

	var headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	};

	return fetch(url, {
		method: 'HEAD',
		headers: headers,
		mode: 'cors',
		body: null
	}).then(function (response) {
		return parseInt(response.headers.get('X-WP-TotalPages'), 10) || 1;
	});
}