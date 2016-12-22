/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import * as selectors from '../src/selectors';
import events from './fixtures/events';

const eventsById = keyBy(events, 'id');

const state = deepFreeze({
	events: {
		items: eventsById,
		requests: {
			'test-event': false,
			'pending-event': true,
		},
		totalPages: {
			'{"paged":1}': '3',
			'{"paged":2}': '3',
		},
		queryRequests: {
			'{"paged":1}': false,
			'{"paged":2}': false,
			'{"paged":3}': true,
		},
		queries: {
			'{"paged":1}': [
				2,
				5,
			],
			'{"paged":2}': [
				6,
				8,
			]
		},
		slugs: {
			'test-event': 2,
			'another-event': 5,
			'another-event-another-event': 6,
			'event-another-event': 8,
		}
	}
});

describe('Event selectors', function() {
	it('should contain isRequestingEvent method', function() {
		expect(selectors.isRequestingEvent).to.be.a('function');
	});

	it('should contain getEventIdFromSlug method', function() {
		expect(selectors.getEventIdFromSlug).to.be.a('function');
	});

	it('should contain getEvent method', function() {
		expect(selectors.getEvent).to.be.a('function');
	});

	it('should contain isRequestingEventsForQuery method', function() {
		expect(selectors.isRequestingEventsForQuery).to.be.a('function');
	});

	it('should contain getEventsForQuery method', function() {
		expect(selectors.getEventsForQuery).to.be.a('function');
	});

	it('should contain getTotalPagesForQuery method', function() {
		expect(selectors.getTotalPagesForQuery).to.be.a('function');
	});

	describe('isRequestingEvent', function() {
		it('Should get `false` if the event has not been requested yet', function() {
			expect(selectors.isRequestingEvent(state, 'unrequested-event')).to.be.false;
		});

		it('Should get `false` if this event has already been fetched', function() {
			expect(selectors.isRequestingEvent(state, 'test-event')).to.be.false;
		});

		it('Should get `true` if this event is being fetched', function() {
			expect(selectors.isRequestingEvent(state, 'pending-event')).to.be.true;
		});
	});

	describe('getEventIdFromSlug', function() {
		it('Should get `false` if the event has not been requested yet', function() {
			expect(selectors.getEventIdFromSlug( state, 'unrequested-event')).to.be.false;
		});

		it( 'Should get the event ID if this event is in our state', function() {
			expect(selectors.getEventIdFromSlug( state, 'test-event')).to.eql(2);
		});
	});

	describe('getEvent', function() {
		it('Should get `undefined` if the event has not been requested yet', function() {
			expect(selectors.getEvent(state, 10)).to.be.undefined;
		});

		it('Should get the event object if this event is in our state', function() {
			expect(selectors.getEvent(state, 2)).to.eql(eventsById[2]);
		});
	});

	describe('isRequestingEventsForQuery', function() {
		it('Should get `false` if the event query has not been requested yet', function() {
			expect(selectors.isRequestingEventsForQuery(state, { paged: 4 })).to.be.false;
		});

		it('Should get `false` if this event query has already been fetched', function() {
			expect(selectors.isRequestingEventsForQuery(state, { paged: 1 } )).to.be.false;
		});

		it('Should get `true` if this event query is being fetched', function() {
			expect(selectors.isRequestingEventsForQuery(state, { paged: 3 })).to.be.true;
		});
	});

	describe('getEventsForQuery', function() {
		it('Should get null if the event query has not been requested yet', function() {
			expect(selectors.getEventsForQuery(state, { paged: 4 })).to.be.null;
		});

		it('Should get a list of event objects if the response is in our state', function() {
			const eventList = [
				eventsById[2],
				eventsById[5]
			];
			expect(selectors.getEventsForQuery(state, { paged: 1 })).to.eql(eventList);
		});
	});

	describe('getTotalPagesForQuery', function() {
		it('Should get a default number (1) of pages available if the query has not been requested yet', function() {
			expect(selectors.getTotalPagesForQuery(state, { paged: 4 })).to.eql(1);
		});

		it('Should get the number of pages (pagination) available for a query', function() {
			expect(selectors.getTotalPagesForQuery(state, { paged: 1 })).to.eql(3);
		});
	});
});
