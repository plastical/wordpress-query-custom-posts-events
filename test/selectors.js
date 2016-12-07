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
import users from './fixtures/users';

const usersById = keyBy(users, 'id');

const state = deepFreeze({
	users: {
		items: usersById,
		requests: {
			'wclark': false,
			'pending-user': true,
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
			'wclark': 2,
			'joanne-smith': 5,
			'robrad': 6,
			'mattspring': 8,
		}
	}
});

describe('User selectors', function() {
	it('should contain isRequestingUser method', function() {
		expect(selectors.isRequestingUser).to.be.a('function');
	});

	it('should contain getUserIdFromSlug method', function() {
		expect(selectors.getUserIdFromSlug).to.be.a('function');
	});

	it('should contain getUser method', function() {
		expect(selectors.getUser).to.be.a('function');
	});

	it('should contain isRequestingUsersForQuery method', function() {
		expect(selectors.isRequestingUsersForQuery).to.be.a('function');
	});

	it('should contain getUsersForQuery method', function() {
		expect(selectors.getUsersForQuery).to.be.a('function');
	});

	it('should contain getTotalPagesForQuery method', function() {
		expect(selectors.getTotalPagesForQuery).to.be.a('function');
	});

	describe('isRequestingUser', function() {
		it('Should get `false` if the user has not been requested yet', function() {
			expect(selectors.isRequestingUser(state, 'unrequested-user')).to.be.false;
		});

		it('Should get `false` if this user has already been fetched', function() {
			expect(selectors.isRequestingUser(state, 'wclark')).to.be.false;
		});

		it('Should get `true` if this user is being fetched', function() {
			expect(selectors.isRequestingUser(state, 'pending-user')).to.be.true;
		});
	});

	describe('getUserIdFromSlug', function() {
		it('Should get `false` if the user has not been requested yet', function() {
			expect(selectors.getUserIdFromSlug( state, 'unrequested-user')).to.be.false;
		});

		it( 'Should get the user ID if this user is in our state', function() {
			expect(selectors.getUserIdFromSlug( state, 'wclark')).to.eql(2);
		});
	});

	describe('getUser', function() {
		it('Should get `undefined` if the user has not been requested yet', function() {
			expect(selectors.getUser(state, 10)).to.be.undefined;
		});

		it('Should get the user object if this user is in our state', function() {
			expect(selectors.getUser(state, 2)).to.eql(usersById[2]);
		});
	});

	describe('isRequestingUsersForQuery', function() {
		it('Should get `false` if the user query has not been requested yet', function() {
			expect(selectors.isRequestingUsersForQuery(state, { paged: 4 })).to.be.false;
		});

		it('Should get `false` if this user query has already been fetched', function() {
			expect(selectors.isRequestingUsersForQuery(state, { paged: 1 } )).to.be.false;
		});

		it('Should get `true` if this user query is being fetched', function() {
			expect(selectors.isRequestingUsersForQuery(state, { paged: 3 })).to.be.true;
		});
	});

	describe('getUsersForQuery', function() {
		it('Should get null if the user query has not been requested yet', function() {
			expect(selectors.getUsersForQuery(state, { paged: 4 })).to.be.null;
		});

		it('Should get a list of user objects if the response is in our state', function() {
			const userList = [
				usersById[2],
				usersById[5]
			];
			expect(selectors.getUsersForQuery(state, { paged: 1 })).to.eql(userList);
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
