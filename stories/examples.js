import React from 'react';
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';

export function ExampleNodeCollapse({ data, click }) {
	const icon = (!data.get('collapsed') && data.get('type') !== 'search') ?
		'folder-open' : data.get('type');
	return (
		<span onClick={click} style={{ padding: '0.0rem 0.5rem', border: '0.1rem' }} >
			<FontAwesome
				name={icon}
				style={{ padding: '0.0rem 0.5rem',
					textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
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
		<span style={{ padding: '0.0rem 0.5rem', border: '0.1rem' }} >
			<FontAwesome
				name={data.get('type')}
				style={{ padding: '0.0rem 0.5rem',
					textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
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
		<span style={{ padding: '0.0rem 0.5rem', border: '0.1rem' }} >
			<input
				id={`checkbox_node_${data.get('id')}`}
				type="checkbox"
				checked={data.get('selected')}
				onChange={select}
			/>
			<FontAwesome
				name={data.get('type')}
				style={{ padding: '0.0rem 0.5rem',
					textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)' }}
			/>
			<small>{data.get('title')}</small>
		</span>
	);
}


ExampleNodeSelection.propTypes = {
	data: PropTypes.shape({}).isRequired,
	select: PropTypes.func.isRequired,
};
