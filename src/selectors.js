/**
 * Internal dependencies
 */
import {
	getSerializedEventsQuery
} from './utils';

/**
 * Returns a event object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Event global ID
 * @return {Object}          Event object
 */
export function getEvent(state, globalId) {
	return state.events.items[globalId];
}

/**
 * Returns an array of events for the events query, or null if no events have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Event query object
 * @return {?Array}         Events for the event query
 */
export function getEventsForQuery(state, query) {
	const serializedQuery = getSerializedEventsQuery(query);
	if (!state.events.queries[serializedQuery]) {
		return null;
	}

	return state.events.queries[serializedQuery].map((globalId) => {
		return getEvent(state, globalId);
	}).filter(Boolean);
}

/**
 * Returns true if currently requesting events for the events query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Event query object
 * @return {Boolean}        Whether events are being requested
 */
export function isRequestingEventsForQuery(state, query) {
	const serializedQuery = getSerializedEventsQuery(query);
	return !!state.events.queryRequests[serializedQuery];
}

/**
 * Returns the number of total pages available for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Event query object
 * @return {int}            Number of pages
 */
export function getTotalPagesForQuery(state, query) {
	const serializedQuery = getSerializedEventsQuery(query);
	if (!state.events.totalPages[serializedQuery]) {
		return 1;
	}

	return parseInt(state.events.totalPages[serializedQuery], 10);
}

/**
 * Returns true if a request is in progress for the specified event, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  eventSlug  Event Slug
 * @return {Boolean}           Whether request is in progress
 */
export function isRequestingEvent(state, eventSlug) {
	if (!state.events.requests) {
		return false;
	}

	return !!state.events.requests[eventSlug];
}

/**
 * Returns the Event ID for a given page slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  slug   Event slug
 * @return {int}            Event ID
 */
export function getEventIdFromSlug(state, slug) {
	if (!state.events.slugs[slug]) {
		return false;
	}

	return state.events.slugs[slug];
}
