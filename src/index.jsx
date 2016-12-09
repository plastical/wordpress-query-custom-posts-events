/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingUsersForQuery, isRequestingUser } from './selectors';
import { requestUsers, requestUser } from './state';

const debug = debugFactory( 'query:user' );

class QueryUsers extends Component {
	componentWillMount() {
		this.request(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.userSlug === nextProps.userSlug &&
				shallowEqual( this.props.query, nextProps.query)) {
			return;
		}

		this.request(nextProps);
	}

	request(props) {
		const single = !!props.userSlug;

		if (!single && !props.requestingUsers) {
			debug(`Request user list using query ${props.query}`);
			props.requestUsers(props.query);
		}

		if (single && !props.requestingUser) {
			debug(`Request single user ${props.userSlug}`);
			props.requestUser(props.userSlug);
		}
	}

	render() {
		return null;
	}
}

QueryUsers.propTypes = {
	userSlug: PropTypes.string,
	query: PropTypes.object,
	requestingUsers: PropTypes.bool,
	requestUsers: PropTypes.func
};

QueryUsers.defaultProps = {
	requestUsers: () => {}
};

export default connect(
	(state, ownProps) => {
		const {userSlug, query} = ownProps;
		return {
			requestingUser: isRequestingUser(state, userSlug),
			requestingUsers: isRequestingUsersForQuery(state, query)
		};
	},
	(dispatch) => {
		return bindActionCreators({
			requestUsers,
			requestUser
		}, dispatch);
	}
)(QueryUsers);
