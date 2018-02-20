import Tree from './Tree';
import actions from './actions';
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
export { positions, actions };
export default Tree;
