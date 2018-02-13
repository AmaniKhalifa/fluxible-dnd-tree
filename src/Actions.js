
const actions = {
	COLLAPSE: 'COLLAPSE',
	SELECT: 'SELECT',
	CANCEL_DROP: 'CANCEL_DROP',
	DROP: 'DROP',
	HOVER: 'HOVER',
};

export default actions;


export function createDropAction(dragged, target, position) {
	return {
		type: actions.DROP,
		dragged: dragged.get('node'),
		target: target.get('node'),
		position,
	};
}


export function createHoverAction(dragged, target, position) {
	return {
		type: actions.HOVER,
		dragged: dragged.get('node'),
		target: target.get('node'),
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
