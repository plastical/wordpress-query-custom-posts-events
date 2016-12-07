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
	USER_REQUEST,
	USER_REQUEST_FAILURE,
	USER_REQUEST_SUCCESS,
	USERS_RECEIVE,
	USERS_REQUEST,
	USERS_REQUEST_FAILURE,
	USERS_REQUEST_SUCCESS,
	// reducers
	items,
	requests,
	totalPages,
	queryRequests,
	queries,
	slugs
} from '../src/state';

import users from './fixtures/users';
import user from './fixtures/single';

describe('User reducer', () => {
	describe('items', () => {
		it( 'should have no change by default', () => {
			const newState = items(undefined, {});
			expect(newState).to.eql( {});
		});

		it('should store the new users in state', () => {
			const newState = items(undefined, { type: USERS_RECEIVE, users });
			const usersById = keyBy(users, 'id');
			expect(newState).to.eql(usersById);
		});

		it('should add new users onto the existing user array', () => {
			const originalState = deepFreeze(keyBy(users, 'id'));
			const newState = items( originalState, {type: USERS_RECEIVE, users: [user]});
			expect(newState).to.eql({...originalState, 9: user});
		});
	});

	describe('queryRequests', () => {
		it('should have no change by default', () => {
			const newState = queryRequests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of new queries', () => {
			const newState = queryRequests(undefined, {type: USERS_REQUEST, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': true});
		});

		it('should track the requesting state of successful queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true});
			const newState = queryRequests(originalState, {type: USERS_REQUEST_SUCCESS, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});

		it('should track the requesting state of failed queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true });
			const newState = queryRequests(originalState, {type: USERS_REQUEST_FAILURE, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});

		it('should track the requesting state of additional queries', () => {
			const originalState = deepFreeze({'{"paged":1}': false });
			const newState = queryRequests(originalState, {type: USERS_REQUEST, query: {paged: 2}});
			expect(newState).to.eql({...originalState, '{"paged":2}': true});
		} );
	});

	describe('requests', () => {
		it('should have no change by default', () => {
			const newState = requests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of a new user', () => {
			const newState = requests(undefined, {type: USER_REQUEST, userSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': true});
		});

		it('should track the requesting state of successful user requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: USER_REQUEST_SUCCESS, userSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': false});
		});

		it('should track the requesting state of failed user requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: USER_REQUEST_FAILURE, userSlug: 'some-pending-slug'});
			expect(newState).to.eql({ 'some-pending-slug': false } );
		});

		it('should track the requesting state of additional user requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: USER_REQUEST, userSlug: 'a-new-user'});
			expect(newState).to.eql({...originalState, 'a-new-user': true});
		});
	});

	describe('queries', () => {
		it('should have no change by default', () => {
			const newState = queries(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the user IDs for requested queries', () => {
			const action = {
				type: USERS_REQUEST_SUCCESS,
				query: {paged: 1},
				users
			};
			const newState = queries(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': [2, 5, 6, 8] });
		});

		it('should track the user IDs for additional requested queries', () => {
			const originalState = deepFreeze({ '{"paged":1}': [2, 5, 6, 8] });
			const action = {
				type: USERS_REQUEST_SUCCESS,
				query: {paged: 2},
				users: [user]
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

		it('should track the user IDs for requested user slugs', () => {
			const action = {
				type: USER_REQUEST_SUCCESS,
				userId: 2,
				userSlug: 'wclark',
			};
			const newState = slugs(undefined, action);
			expect(newState).to.eql({'wclark': 2});
		});

		it('should track the user IDs for additional requested user slugs', () => {
			const originalState = deepFreeze({'wclark': 2});
			const action = {
				type: USER_REQUEST_SUCCESS,
				userId: 9,
				userSlug: 'billy-bob',
			};
			const newState = slugs(originalState, action);
			expect(newState).to.eql({
				'wclark': 2,
				'billy-bob': 9
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
				type: USERS_REQUEST_SUCCESS,
				query: {paged: 1},
				totalPages: 3
			};
			const newState = totalPages(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': 3 });
		});
	});
});
