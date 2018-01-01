import { configure } from '@kadira/storybook';

function loadStories() {
	require('../stories'); // eslint-disable-line
}

configure(loadStories, module);
