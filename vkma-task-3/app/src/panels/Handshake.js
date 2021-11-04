import React from 'react';
import {Panel, PanelHeader, Placeholder, Snackbar, Button} from '@vkontakte/vkui';
import { Icon56UsersOutline, Icon28GlobeOutline, Icon28UserIncomingOutline, Icon20Hand } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";
let last_x = 0, last_y = 0, last_z = 0;

export default class Handshake extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			friendConnected: false,
			connected: false,
			snackbar: null,
			friend: null,
			socket: null,
			timer: null,
		}
	}

	detectShaking = (x, y, z) => {
		if (this.state.friendConnected && this.state.socket) {
			let speed = Math.abs(x + y + z - last_x - last_y - last_z);
			if (speed > 3) {
				last_x = x;
				last_y = y;
				last_z = z;

				if (this.state.timer) {
					clearTimeout(this.state.timer)
				} else {
					this.state.socket.send(JSON.stringify({type: 'start_shaking'}));
				}

				let timer = setTimeout(() => {
					if (this.state.socket) {
						this.state.socket.send(JSON.stringify({type: 'stop_shaking'}));
					}
					this.setState({timer: null})
				}, 500);
				this.setState({timer: timer});
			}
		}
	}

	componentDidMount() {
		bridge.send("VKWebAppDeviceMotionStart", {refresh_rate: 50});
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppDeviceMotionChanged') {
				this.detectShaking(data['beta'], data['gamma'], data['alpha']);
			}
		});
	}

	connectToWebsocket = () => {
		const endpoint = 'wss://websocket.adawhite.ru/vkma-3' + window.location.search + '&friend=' + this.state.friend.id;
		let socket = new WebSocket(endpoint);
		this.setState({socket: socket});

		socket.onclose = () => this.setState({connected: false});

		socket.onmessage = (event) => {
			event = JSON.parse(event.data);
			console.log(event);
			if (event.type === 'connected') {
				this.setState({connected: true, friendConnected: event.isFriendConnected});
			} else if (event.type === 'friend_connected') {
				this.setState({friendConnected: true});
			} else if (event.type === 'friend_disconnected') {
				this.setState({friendConnected: false});
			} else if (event.type === 'handshake') {
				bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"});
				this.setState({
					snackbar: <Snackbar onClose={() => this.setState({snackbar: null})}>Вы пожали друг другу руки!</Snackbar>
				}, this.stop)
			}
		}
	}

	stop = () => {
		if (!this.state.socket.closed) {
			this.state.socket.close()
		}

		this.setState({
			friendConnected: false,
			connected: false,
			friend: null,
			socket: null,
			timer: null,
		})
	}

	selectFriend = () => {
		bridge.send("VKWebAppGetFriends", {}).then(data => {
			if (data.users.length) {
				this.setState({friend: data.users[0]});
				this.connectToWebsocket();
			}
		});
	}

	render() {
		return (
			<Panel id={this.props.id}>
				<PanelHeader>Рукопожатие</PanelHeader>
				{
					!this.state.friend ?
						<Placeholder stretched header={"Выберите друга"} icon={<Icon56UsersOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
									 action={<Button onClick={this.selectFriend} size={'m'}>Выбрать</Button>}>
							Чтобы "пожать" ему руку
						</Placeholder>
						:
						!this.state.connected ?
							<Placeholder stretched header={"Подождите..."} icon={<Icon28GlobeOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
										 action={<Button onClick={this.stop} size={'m'} mode={'destructive'}>Отмена</Button>}>
								Подключаем вас к серверу
							</Placeholder>
							:
							!this.state.friendConnected ?
								<Placeholder stretched header={"Зовите друга!"} icon={<Icon28UserIncomingOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
											 action={<Button onClick={this.stop} size={'m'} mode={'destructive'}>Отмена</Button>}>
									Поделитесь ссылкой на приложение и попросите выбрать вас из списка друзей
								</Placeholder>
								:
								<Placeholder stretched header={"Трясите телефон!"} icon={<Icon20Hand width={128} height={128} fill={'var(--button_primary_background)'}/>}
											 action={<Button onClick={this.stop} size={'m'} mode={'destructive'}>Отмена</Button>}>
									Если вы будете трясти телефон одновременно с другом, мы засчитаем это за рукопожатие
								</Placeholder>
				}

				{this.state.snackbar}
			</Panel>
		)
	}
}
