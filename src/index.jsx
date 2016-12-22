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
import { isRequestingEventsForQuery, isRequestingEvent } from './selectors';
import { requestEvents, requestEvent } from './state';

const debug = debugFactory( 'query:event' );

class QueryEvents extends Component {
	componentWillMount() {
		this.request(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.eventSlug === nextProps.eventSlug &&
				shallowEqual( this.props.query, nextProps.query)) {
			return;
		}

		this.request(nextProps);
	}

	request(props) {
		const single = !!props.eventSlug;

		if (!single && !props.requestingEvents) {
			debug(`Request event list using query ${props.query}`);
			props.requestEvents(props.query);
		}

		if (single && !props.requestingEvent) {
			debug(`Request single event ${props.eventSlug}`);
			props.requestEvent(props.eventSlug);
		}
	}

	render() {
		return null;
	}
}

QueryEvents.propTypes = {
	eventSlug: PropTypes.string,
	query: PropTypes.object,
	requestingEvents: PropTypes.bool,
	requestEvents: PropTypes.func
};

QueryEvents.defaultProps = {
	requestEvents: () => {}
};

export default connect(
	(state, ownProps) => {
		const {eventSlug, query} = ownProps;
		return {
			requestingEvent: isRequestingEvent(state, eventSlug),
			requestingEvents: isRequestingEventsForQuery(state, query)
		};
	},
	(dispatch) => {
		return bindActionCreators({
			requestEvents,
			requestEvent
		}, dispatch);
	}
)(QueryEvents);
