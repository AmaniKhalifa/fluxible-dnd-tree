import Tree from './Tree';
import actions, { createDropAction, createHoverAction, createCancelDropAction,
		createSelectAction, createCollapseAction,
		createDragAction, createStopHoverAction } from './actions';
import positions from './positions';
import { collapseNode, selectNode, cancelDrop,
	setHoverEffects, dropNode, dragNode, stopHover } from './reducers';

export const reducers = { collapseNode,
	selectNode,
	cancelDrop,
	setHoverEffects,
	dropNode,
	dragNode,
	stopHover };

export const actionCreators = { createDropAction,
	createHoverAction,
	createCancelDropAction,
	createSelectAction,
	createCollapseAction,
	createDragAction,
	createStopHoverAction };

export { positions, actions };
export default Tree;
