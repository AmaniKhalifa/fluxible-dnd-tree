import Tree, { Positions } from './Tree';
import Actions from './Actions';
import { collapseNode, selectNode, removeAllEffects,
	setHoverEffects, dropNode } from './Reducers';

export const Reducers = { collapseNode,
	selectNode,
	removeAllEffects,
	setHoverEffects,
	dropNode };
export { Positions, Actions };
export default Tree;
