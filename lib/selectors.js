'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUser = getUser;
exports.getUsersForQuery = getUsersForQuery;
exports.isRequestingUsersForQuery = isRequestingUsersForQuery;
exports.getTotalPagesForQuery = getTotalPagesForQuery;
exports.isRequestingUser = isRequestingUser;
exports.getUserIdFromSlug = getUserIdFromSlug;

var _utils = require('./utils');

/**
 * Returns a user object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId User global ID
 * @return {Object}          User object
 */
function getUser(state, globalId) {
  return state.users.items[globalId];
}

/**
 * Returns an array of users for the users query, or null if no users have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  User query object
 * @return {?Array}         Users for the user query
 */
/**
 * Internal dependencies
 */
function getUsersForQuery(state, query) {
  var serializedQuery = (0, _utils.getSerializedUsersQuery)(query);
  if (!state.users.queries[serializedQuery]) {
    return null;
  }

  return state.users.queries[serializedQuery].map(function (globalId) {
    return getUser(state, globalId);
  }).filter(Boolean);
}

/**
 * Returns true if currently requesting users for the users query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  User query object
 * @return {Boolean}        Whether users are being requested
 */
function isRequestingUsersForQuery(state, query) {
  var serializedQuery = (0, _utils.getSerializedUsersQuery)(query);
  return !!state.users.queryRequests[serializedQuery];
}

/**
 * Returns the number of total pages available for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  User query object
 * @return {int}            Number of pages
 */
function getTotalPagesForQuery(state, query) {
  var serializedQuery = (0, _utils.getSerializedUsersQuery)(query);
  if (!state.users.totalPages[serializedQuery]) {
    return 1;
  }

  return parseInt(state.users.totalPages[serializedQuery], 10);
}

/**
 * Returns true if a request is in progress for the specified user, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  userSlug  User Slug
 * @return {Boolean}           Whether request is in progress
 */
function isRequestingUser(state, userSlug) {
  if (!state.users.requests) {
    return false;
  }

  return !!state.users.requests[userSlug];
}

/**
 * Returns the User ID for a given page slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  slug   User slug
 * @return {int}            User ID
 */
function getUserIdFromSlug(state, slug) {
  if (!state.users.slugs[slug]) {
    return false;
  }

  return state.users.slugs[slug];
}