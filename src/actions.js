
const actions = {
	COLLAPSE: 'COLLAPSE',
	SELECT: 'SELECT',
	CANCEL_DROP: 'CANCEL_DROP',
	DROP: 'DROP',
	DRAG: 'DRAG',
	HOVER: 'HOVER',
	STOP_HOVER: 'STOP_HOVER',
};

export default actions;


export function createDropAction(dragged, target, position) {
	return {
		type: actions.DROP,
		dragged,
		target,
		position,
	};
}


export function createHoverAction(dragged, target, position) {
	return {
		type: actions.HOVER,
		dragged,
		target,
		position,
	};
}


export function createCancelDropAction() {
	return { type: actions.CANCEL_DROP };
}


export function createSelectAction(selected) {
	return { type: actions.SELECT, selected };
}


export function createCollapseAction(collapsed) {
	return { type: actions.COLLAPSE, collapsed };
}
