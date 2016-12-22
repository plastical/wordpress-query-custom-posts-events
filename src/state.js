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
	getSerializedEventsQuery
} from './utils';

/**
 * Event actions
 */
export const EVENT_REQUEST = 'wordpress-redux/event/REQUEST';
export const EVENT_REQUEST_SUCCESS = 'wordpress-redux/event/REQUEST_SUCCESS';
export const EVENT_REQUEST_FAILURE = 'wordpress-redux/event/REQUEST_FAILURE';
export const EVENTS_RECEIVE = 'wordpress-redux/events/RECEIVE';
export const EVENTS_REQUEST = 'wordpress-redux/events/REQUEST';
export const EVENTS_REQUEST_SUCCESS = 'wordpress-redux/events/REQUEST_SUCCESS';
export const EVENTS_REQUEST_FAILURE = 'wordpress-redux/events/REQUEST_FAILURE';

/**
 * Tracks all known events, indexed by event global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items(state = {}, action) {
	switch (action.type) {
		case EVENTS_RECEIVE:
			const events = keyBy(action.events, 'id');
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
export function requests(state = {}, action) {
	switch (action.type) {
		case EVENT_REQUEST:
		case EVENT_REQUEST_SUCCESS:
		case EVENT_REQUEST_FAILURE:
			return Object.assign({}, state, { [action.eventSlug]: EVENT_REQUEST === action.type });
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
export function queryRequests(state = {}, action) {
	switch (action.type) {
		case EVENTS_REQUEST:
		case EVENTS_REQUEST_SUCCESS:
		case EVENTS_REQUEST_FAILURE:
			const serializedQuery = getSerializedEventsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: EVENTS_REQUEST === action.type
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
		case EVENTS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedEventsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.totalPages
			});      
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
export function queries(state = {}, action) {
	switch (action.type) {
		case EVENTS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedEventsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.events.map((event) => event.id)
			});
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
export function slugs(state = {}, action) {
	switch (action.type) {
		case EVENT_REQUEST_SUCCESS:
			return Object.assign({}, state, {
				[action.eventSlug]: action.eventId
			});
		case EVENTS_RECEIVE:
			const events = reduce(action.events, (memo, u) => {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, events);
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
 * Triggers a network request to fetch events for the specified site and query.
 *
 * @param  {String}   query  Event query
 * @return {Function}        Action thunk
 */
export function requestEvents(query = {}) {
	return (dispatch) => {
		dispatch({
			type: EVENTS_REQUEST,
			query
		});

		query._embed = true;

		api.get('/wp/v2/events', query).then(events => {
			dispatch({
				type: EVENTS_RECEIVE,
				events
			});
			requestPageCount('/wp/v2/events', query).then(count => {
				dispatch({
					type: EVENTS_REQUEST_SUCCESS,
					query,
					totalPages: count,
					events
				});
			} );
			return null;
		}).catch((error) => {
			dispatch({
				type: EVENTS_REQUEST_FAILURE,
				query,
				error
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
export function requestEvent(eventSlug) {
	return (dispatch) => {
		dispatch({
			type: EVENT_REQUEST,
			eventSlug
		});

		const query = {
			slug: eventSlug,
			_embed: true,
		};

		api.get('/wp/v2/events', query).then(data => {
			const event = data[0];
			dispatch({
				type: EVENTS_RECEIVE,
				events: [event]
			});
			dispatch({
				type: EVENT_REQUEST_SUCCESS,
				eventId: event.id,
				eventSlug
			});
			return null;
		}).catch((error) => {
			dispatch({
				type: EVENT_REQUEST_FAILURE,
				eventSlug,
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
