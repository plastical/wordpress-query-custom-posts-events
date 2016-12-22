/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	// action-types
	EVENT_REQUEST,
	EVENT_REQUEST_FAILURE,
	EVENT_REQUEST_SUCCESS,
	EVENTS_RECEIVE,
	EVENTS_REQUEST,
	EVENTS_REQUEST_FAILURE,
	EVENTS_REQUEST_SUCCESS,
	// reducers
	items,
	requests,
	totalPages,
	queryRequests,
	queries,
	slugs
} from '../src/state';

import events from './fixtures/events';
import event from './fixtures/single';

describe('Event reducer', () => {
	describe('items', () => {
		it( 'should have no change by default', () => {
			const newState = items(undefined, {});
			expect(newState).to.eql( {});
		});

		it('should store the new events in state', () => {
			const newState = items(undefined, { type: EVENTS_RECEIVE, events });
			const eventsById = keyBy(events, 'id');
			expect(newState).to.eql(eventsById);
		});

		it('should add new events onto the existing event array', () => {
			const originalState = deepFreeze(keyBy(events, 'id'));
			const newState = items( originalState, {type: EVENTS_RECEIVE, events: [event]});
			expect(newState).to.eql({...originalState, 9: event});
		});
	});

	describe('queryRequests', () => {
		it('should have no change by default', () => {
			const newState = queryRequests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of new queries', () => {
			const newState = queryRequests(undefined, {type: EVENTS_REQUEST, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': true});
		});

		it('should track the requesting state of successful queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true});
			const newState = queryRequests(originalState, {type: EVENTS_REQUEST_SUCCESS, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});

		it('should track the requesting state of failed queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true });
			const newState = queryRequests(originalState, {type: EVENTS_REQUEST_FAILURE, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});

		it('should track the requesting state of additional queries', () => {
			const originalState = deepFreeze({'{"paged":1}': false });
			const newState = queryRequests(originalState, {type: EVENTS_REQUEST, query: {paged: 2}});
			expect(newState).to.eql({...originalState, '{"paged":2}': true});
		} );
	});

	describe('requests', () => {
		it('should have no change by default', () => {
			const newState = requests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of a new event', () => {
			const newState = requests(undefined, {type: EVENT_REQUEST, eventSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': true});
		});

		it('should track the requesting state of successful event requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: EVENT_REQUEST_SUCCESS, eventSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': false});
		});

		it('should track the requesting state of failed event requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: EVENT_REQUEST_FAILURE, eventSlug: 'some-pending-slug'});
			expect(newState).to.eql({ 'some-pending-slug': false } );
		});

		it('should track the requesting state of additional event requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: EVENT_REQUEST, eventSlug: 'a-new-event'});
			expect(newState).to.eql({...originalState, 'a-new-event': true});
		});
	});

	describe('queries', () => {
		it('should have no change by default', () => {
			const newState = queries(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the event IDs for requested queries', () => {
			const action = {
				type: EVENTS_REQUEST_SUCCESS,
				query: {paged: 1},
				events
			};
			const newState = queries(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': [2, 5, 6, 8] });
		});

		it('should track the event IDs for additional requested queries', () => {
			const originalState = deepFreeze({ '{"paged":1}': [2, 5, 6, 8] });
			const action = {
				type: EVENTS_REQUEST_SUCCESS,
				query: {paged: 2},
				events: [event]
			};
			const newState = queries(originalState, action);
			expect(newState).to.eql({
				'{"paged":1}': [2, 5, 6, 8],
				'{"paged":2}': [9]
			});
		});
	});

	describe('slugs', () => {
		it('should have no change by default', () => {
			const newState = slugs(undefined, {});
			expect( newState ).to.eql({});
		});

		it('should track the event IDs for requested event slugs', () => {
			const action = {
				type: EVENT_REQUEST_SUCCESS,
				eventId: 2,
				eventSlug: 'test-event',
			};
			const newState = slugs(undefined, action);
			expect(newState).to.eql({'test-event': 2});
		});

		it('should track the event IDs for additional requested event slugs', () => {
			const originalState = deepFreeze({'test-event': 2});
			const action = {
				type: EVENT_REQUEST_SUCCESS,
				eventId: 9,
				eventSlug: 'test-oooo-event',
			};
			const newState = slugs(originalState, action);
			expect(newState).to.eql({
				'test-event': 2,
				'test-oooo-event': 9
			});
		});
	});

	describe('totalPages', () => {
		it('should have no change by default', () => {
			const newState = totalPages(undefined,{});
			expect(newState).to.eql({});
		});

		it('should track the pagination count for requested queries', () => {
			const action = {
				type: EVENTS_REQUEST_SUCCESS,
				query: {paged: 1},
				totalPages: 3
			};
			const newState = totalPages(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': 3 });
		});
	});
});
