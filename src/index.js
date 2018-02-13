import Tree from './Tree';
import actions, { createDropAction, createHoverAction, createCancelDropAction,
	createSelectAction, createCollapseAction } from './actions';
import positions from './positions';
import { collapseNode, selectNode, removeAllEffects,
	setHoverEffects, dropNode } from './reducers';

export const reducers = { collapseNode,
	selectNode,
	removeAllEffects,
	setHoverEffects,
	dropNode };

export const actionCreators = { createDropAction,
	createHoverAction,
	createCancelDropAction,
	createSelectAction,
	createCollapseAction };

export { positions, actions };
export default Tree;
