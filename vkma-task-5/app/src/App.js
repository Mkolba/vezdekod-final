import React from 'react';
import { View, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import MazePanel from './panels/Maze';

export default class App extends React.Component {
	render() {
		return (
			<AdaptivityProvider>
				<AppRoot>
					<View activePanel='maze'>
						<MazePanel id='maze'/>
					</View>
				</AppRoot>
			</AdaptivityProvider>
		)
	}
}
