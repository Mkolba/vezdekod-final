import React from 'react';
import { View, Panel, Alert, PanelHeader, Placeholder, Button, Link } from '@vkontakte/vkui';
import { Icon28QrCodeOutline } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";

// Менять тут
const AVAILABLE_DOMAINS = ['vk.com'];

export default class Scan extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			popout: null,
		}
	}

	isLink = (text) => {
		let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return !!pattern.test(text);
	}

	isLinkAllowed = (link) => {
		const url = new URL(link);
		return AVAILABLE_DOMAINS.includes(url.hostname);
	}

	componentDidMount() {
		if (window.location.hash) {
			let text = window.atob(window.location.hash.slice(1));
			this.setState({popout:
					<Alert header={'Результат сканирования'} onClose={() => this.setState({popout: null})}
						   actions={[{
							   title: 'Закрыть',
							   autoclose: true,
							   mode: 'cancel'
						   }]}
					>
						{!this.isLink(text) ? text : <Link href={text} target={'_blank'}>{text}</Link>}
					</Alert>
			});
			window.location.hash = '';
		}
	}

	scanQR = () => {
		bridge.send('VKWebAppOpenCodeReader').then(data => {
			let text = data.code_data;
			if (text) {
				let isLink = this.isLink(text);
				if (!isLink || this.isLinkAllowed(text)) {
					this.setState({popout:
							<Alert header={'Результат сканирования'} onClose={() => this.setState({popout: null})}
								   actions={[{
									   title: 'Поделиться',
									   autoclose: true,
									   action: () => this.props.share(text)
								   }, {
									   title: 'Закрыть',
									   autoclose: true,
									   mode: 'cancel'
								   }]}
							>
								{!isLink ? text : <Link href={text} target={'_blank'}>{text}</Link>}
							</Alert>
					});
					this.props.addScan(text);
				} else {
					this.setState({popout:
							<Alert header={'Результат сканирования'} onClose={() => this.setState({popout: null})}
								   actions={[{
									   title: 'Закрыть',
									   autoclose: true,
									   mode: 'cancel'
								   }]}
							>
								Извините, но приложение распознает только ссылки на домене vk.com

								Изменить список доступных доменов можно в файле /src/tabs/Scan.js
							</Alert>
					});
				}
			}
		})
	}

	render() {
		return (
			<View id={this.props.id} activePanel={'history'} popout={this.state.popout}>
				<Panel id={'history'}>
					<PanelHeader>QR Сканер</PanelHeader>
						<Placeholder icon={<Icon28QrCodeOutline width={128} height={128} fill={'var(--button_primary_background)'}/>}
									 action={<Button size="m" onClick={this.scanQR}>Сканировать QR код</Button>} stretched>
							По-умолчанию ссылки распознаются только на домене vk.com
						</Placeholder>
				</Panel>
			</View>
		)
	}
}
