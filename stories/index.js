import React, { Component } from 'react';
import { storiesOf } from '@kadira/storybook';
import { createStore } from 'redux';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import { ExampleNode, ExampleNodeSelection,
	ExampleNodeCollapse } from '../examples/Example';
import Tree, { Positions, Reducers, Actions } from '../src/index';
import './css/styles.css';
import './css/font-awesome.min.css';


const initState = fromJS({
	tree: [
		{ title: 'Root',
			id: 1,
			type: 'folder',
			selected: false,
			collapsed: false,
			children: [ { title: 'Child',
				selected: false,
				collapsed: false,
				id: 2,
				type: 'folder',
				children: [ {
					title: 'Child 22 abc def ghi',
					selected: false,
					collapsed: false,
					id: 3,
					type: 'search',
				} ],
			}, {
				title: 'Hovered Child',
				selected: false,
				collapsed: false,
				id: 8,
				type: 'folder',
			} ] },
			{ title: 'Empty', id: 4, type: 'search', selected: false, collapsed: false },
		{ title: 'Two Nodes',
			selected: false,
			collapsed: false,
			id: 5,
			type: 'folder',
			children: [
				{ title: 'Node 1',
					selected: false,
					collapsed: false,
					id: 6,
					type: 'search' },
				{ title: 'Node 2',
					selected: false,
					collapsed: false,
					id: 7,
					type: 'folder' },
			] },
	],
});

const store = createStore(reducer, initState);
const DNDstore = createStore(reducer, initState);
const selectionStore = createStore(reducer, initState);
const ExpandCollapseStore = createStore(reducer, initState);

function reducer(state, actionObj) {
	const action = fromJS(actionObj);
	switch (action.get('type')) {
	case Actions.COLLAPSE:
		return state.set('tree', Reducers.collapseNode(state.get('tree'), action));
	case Actions.SELECT:
		return state.set('tree', Reducers.selectNode(state.get('tree'), action));
	case Actions.CANCEL_DROP:
		return state.set('tree', Reducers.removeAllEffects(state.get('tree')));
	case Actions.DROP:
		return state.set('tree', Reducers.dropNode(state.get('tree'), action, canDrop));
	case Actions.HOVER:
		return state.set('tree', Reducers.setHoverEffects(state.get('tree'), action, canDrop));
	default:
		return state;
	}
}

function canDrop(action) {
	if (action.getIn([ 'target', 'type' ]) === 'search' &&
		action.get('position') === Positions.get('INTO')) {
		return false;
	}
	return true;
}


class ReduxWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = this.createStateFromStore(props.store);
		this.unsubscribe = props.subscribe(() => {
			this.setState(this.createStateFromStore(props.store));
		});
	}
	componentWillUnmount() {
		this.unsubscribe();
	}
	createStateFromStore(s) {
		return { tree: s.getState().get('tree') };
	}
	render() {
		const childrenWithProps = React.cloneElement(this.props.children, {
			tree: this.state.tree,
		});
		return (<div>
			{childrenWithProps}
		</div>);
	}
}
ReduxWrapper.propTypes = {
	store: PropTypes.any.isRequired,
	subscribe: PropTypes.func.isRequired,
	children: PropTypes.any.isRequired,
};


storiesOf('Drag and Drop', module).
	add('Hover before rendering', () => {
		const action = {
			type: Actions.HOVER,
			dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
			position: Positions.get('BEFORE'),
		};
		store.dispatch(action);
		return (
			<Tree
				tree={store.getState().get('tree')}
				renderNode={
				(nodeData) => <ExampleNode
					data={nodeData}
				/>
			}
			/>

		);
	}).
		add('Hover after rendering', () => {
			const action = {
				type: Actions.HOVER,
				dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
				position: Positions.get('AFTER'),
			};
			store.dispatch(action);
			return (
				<Tree
					tree={store.getState().get('tree')}
					renderNode={
					(nodeData) => <ExampleNode
						data={nodeData}
					/>
				}
				/>

			);
		}).
			add('Hover In', () => {
				const action = {
					type: Actions.HOVER,
					dragged: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					target: store.getState().getIn([ 'tree', 0, 'children', 1 ]).toJS(),
					position: Positions.get('INTO'),
				};
				store.dispatch(action);
				return (
					<Tree
						tree={store.getState().get('tree')}
						renderNode={
						(nodeData) => <ExampleNode
							data={nodeData}
						/>
						}
					/>

				);
			});

storiesOf('Interactive Tree', module).
		add('DND Tree', () => (
			<ReduxWrapper
				store={DNDstore}
				subscribe={DNDstore.subscribe}
			>
				<Tree
					dispatch={DNDstore.dispatch}
					renderNode={
						(nodeData) => <ExampleNode
							data={nodeData}
						/>
									}
				/>
			</ReduxWrapper>
			)).
		add('Select Node', () => (
			<ReduxWrapper
				store={selectionStore}
				subscribe={selectionStore.subscribe}
			>
				<Tree
					dispatch={selectionStore.dispatch}
					renderNode={
						(nodeData) => <ExampleNodeSelection
							select={() => {
								const action = {
									type: Actions.SELECT,
									selected: nodeData,
								};
								selectionStore.dispatch(action);
							}}
							data={nodeData}
						/>
									}
				/>
			</ReduxWrapper>
			)).
		add('Expand/Collapse Node', () => (
			<ReduxWrapper
				store={ExpandCollapseStore}
				subscribe={ExpandCollapseStore.subscribe}
			>
				<Tree
					dispatch={ExpandCollapseStore.dispatch}
					renderNode={
						(nodeData) => <ExampleNodeCollapse
							click={() => {
								const action = {
									type: Actions.COLLAPSE,
									collapsed: nodeData,
								};
								ExpandCollapseStore.dispatch(action);
							}}
							data={nodeData}
						/>
									}
				/>
			</ReduxWrapper>
			));
