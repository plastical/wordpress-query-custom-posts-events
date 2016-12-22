'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EVENTS_REQUEST_FAILURE = exports.EVENTS_REQUEST_SUCCESS = exports.EVENTS_REQUEST = exports.EVENTS_RECEIVE = exports.EVENT_REQUEST_FAILURE = exports.EVENT_REQUEST_SUCCESS = exports.EVENT_REQUEST = undefined;
exports.items = items;
exports.requests = requests;
exports.queryRequests = queryRequests;
exports.totalPages = totalPages;
exports.queries = queries;
exports.slugs = slugs;
exports.requestEvents = requestEvents;
exports.requestEvent = requestEvent;

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
 * Event actions
 */
var EVENT_REQUEST = exports.EVENT_REQUEST = 'wordpress-redux/event/REQUEST';
var EVENT_REQUEST_SUCCESS = exports.EVENT_REQUEST_SUCCESS = 'wordpress-redux/event/REQUEST_SUCCESS';
var EVENT_REQUEST_FAILURE = exports.EVENT_REQUEST_FAILURE = 'wordpress-redux/event/REQUEST_FAILURE';
var EVENTS_RECEIVE = exports.EVENTS_RECEIVE = 'wordpress-redux/events/RECEIVE';
var EVENTS_REQUEST = exports.EVENTS_REQUEST = 'wordpress-redux/events/REQUEST';
var EVENTS_REQUEST_SUCCESS = exports.EVENTS_REQUEST_SUCCESS = 'wordpress-redux/events/REQUEST_SUCCESS';
var EVENTS_REQUEST_FAILURE = exports.EVENTS_REQUEST_FAILURE = 'wordpress-redux/events/REQUEST_FAILURE';

/**
 * Tracks all known events, indexed by event global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function items() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case EVENTS_RECEIVE:
			var events = (0, _keyBy2.default)(action.events, 'id');
			return Object.assign({}, state, events);
		default:
			return state;
	}
}

/**
 * Returns the updated event requests state after an action has been
 * dispatched. The state reflects a mapping of event ID to a
 * boolean reflecting whether a request for the event is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function requests() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case EVENT_REQUEST:
		case EVENT_REQUEST_SUCCESS:
		case EVENT_REQUEST_FAILURE:
			return Object.assign({}, state, _defineProperty({}, action.eventSlug, EVENT_REQUEST === action.type));
		default:
			return state;
	}
}

/**
 * Returns the updated event query requesting state after an action has been
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
		case EVENTS_REQUEST:
		case EVENTS_REQUEST_SUCCESS:
		case EVENTS_REQUEST_FAILURE:
			var serializedQuery = (0, _utils.getSerializedEventsQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, EVENTS_REQUEST === action.type));
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
		case EVENTS_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedEventsQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.totalPages));
		default:
			return state;
	}
}

/**
 * Returns the updated event query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of event
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
		case EVENTS_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedEventsQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.events.map(function (event) {
				return event.id;
			})));
		default:
			return state;
	}
}

/**
 * Tracks the slug->ID mapping for events
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function slugs() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case EVENT_REQUEST_SUCCESS:
			return Object.assign({}, state, _defineProperty({}, action.eventSlug, action.eventId));
		case EVENTS_RECEIVE:
			var events = (0, _reduce2.default)(action.events, function (memo, u) {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, events);
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
 * Triggers a network request to fetch events for the specified site and query.
 *
 * @param  {String}   query  Event query
 * @return {Function}        Action thunk
 */

function requestEvents() {
	var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return function (dispatch) {
		dispatch({
			type: EVENTS_REQUEST,
			query: query
		});

		query._embed = true;

		api.get('/wp/v2/events', query).then(function (events) {
			dispatch({
				type: EVENTS_RECEIVE,
				events: events
			});
			requestPageCount('/wp/v2/events', query).then(function (count) {
				dispatch({
					type: EVENTS_REQUEST_SUCCESS,
					query: query,
					totalPages: count,
					events: events
				});
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: EVENTS_REQUEST_FAILURE,
				query: query,
				error: error
			});
		});
	};
}

/**
 * Triggers a network request to fetch a specific event from a site.
 *
 * @param  {string}   eventSlug  Event slug
 * @return {Function}           Action thunk
 */
function requestEvent(eventSlug) {
	return function (dispatch) {
		dispatch({
			type: EVENT_REQUEST,
			eventSlug: eventSlug
		});

		var query = {
			slug: eventSlug,
			_embed: true
		};

		api.get('/wp/v2/events', query).then(function (data) {
			var event = data[0];
			dispatch({
				type: EVENTS_RECEIVE,
				events: [event]
			});
			dispatch({
				type: EVENT_REQUEST_SUCCESS,
				eventId: event.id,
				eventSlug: eventSlug
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: EVENT_REQUEST_FAILURE,
				eventSlug: eventSlug,
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