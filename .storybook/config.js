import { configure } from '@kadira/storybook';

function loadStories() {
	// eslint-disable-next-line global-require
	require('../stories');
}

configure(loadStories, module);
