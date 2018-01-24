import Tree from './Tree';
import actions from './actions';
import positions from './positions';
import { collapseNode, selectNode, removeAllEffects,
	setHoverEffects, dropNode } from './reducers';

export const reducers = { collapseNode,
	selectNode,
	removeAllEffects,
	setHoverEffects,
	dropNode };
export { positions, actions };
export default Tree;
