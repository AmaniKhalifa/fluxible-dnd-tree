import React from 'react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';

export function ExampleNodeCollapse({ data, click }) {
	const icon = (!data.get('collapsed') && data.get('type') !== 'search') ?
		'folder-open' : data.get('type');
	return (
		<span onClick={click} className="container" >
			<FontAwesome
				name={icon}
				className="icon"
			/>
			<small>{data.get('title')}</small>
		</span>
	);
}

ExampleNodeCollapse.propTypes = {
	data: PropTypes.shape({}).isRequired,
	click: PropTypes.func.isRequired,
};

export function ExampleNode({ data }) {
	return (
		<span className="container" >
			<FontAwesome
				name={data.get('type')}
				className="icon"
			/>
			<small>{data.get('title')}</small>
		</span>
	);
}

ExampleNode.propTypes = {
	data: PropTypes.shape({}).isRequired,
};


export function ExampleNodeSelection({ data, select }) {
	return (
		<span className="container" >
			<input
				id={`checkbox_node_${data.get('id')}`}
				type="checkbox"
				checked={data.get('selected')}
				onChange={select}
			/>
			<FontAwesome
				name={data.get('type')}
				className="icon"
			/>
			<small>{data.get('title')}</small>
		</span>
	);
}


ExampleNodeSelection.propTypes = {
	data: PropTypes.shape({}).isRequired,
	select: PropTypes.func.isRequired,
};
