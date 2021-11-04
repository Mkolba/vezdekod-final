import React from 'react';
import { View, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import Handshake from './panels/Handshake';

export default class App extends React.Component {
	render() {
		return (
			<AdaptivityProvider>
				<AppRoot>
					<View activePanel={'handshake'}>
						<Handshake id='handshake'/>
					</View>
				</AppRoot>
			</AdaptivityProvider>
		);
	}
}
