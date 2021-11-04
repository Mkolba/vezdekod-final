import React from 'react';
import {View, Panel, Cell, PanelHeader, Placeholder, Group, Header, Alert, Link} from '@vkontakte/vkui';
import { Icon28ScanViewfinderOutline, Icon24Note, Icon24Linked } from '@vkontakte/icons';


export default class History extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			popout: null
		}
	}

	showAlert = (text, isLink) => {
		this.setState({popout:
				<Alert header={'Результат сканирования'} onClose={() => this.setState({popout: null})}
					   actions={[{
						   title: 'Поделиться',
						   autoclose: true,
						   action: () => this.props.share(text)
					   },{
						   title: 'Закрыть',
						   autoclose: true,
						   mode: 'cancel'
					   }]}
				>
					{!isLink ? text : <Link href={text} target={'_blank'}>{text}</Link>}
				</Alert>
		});
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

	render() {
		let {scanned} = this.props;
		return (
			<View id={this.props.id} activePanel={'history'} popout={this.state.popout}>
				<Panel id={'history'}>
					<PanelHeader>QR Сканер</PanelHeader>
					{
						!scanned.length ?
							<Placeholder stretched icon={<Icon28ScanViewfinderOutline width={96} height={96}/>} header={'Пока здесь ничего нет'}>
								Вы ещё не сканировали QR коды.
							</Placeholder>
							:
							<Group header={<Header mode={'secondary'}>Всего распознано: {scanned.length}</Header>}>
								{scanned.map((item, i) => {
									let isLink = this.isLink(item)
									return (
										<Cell key={i} before={isLink ? <Icon24Linked/> : <Icon24Note/>} description={item} onClick={() => this.showAlert(item, isLink)}>
											{isLink ? "Ссылка" : "Текст"}
										</Cell>
									)
								})}
							</Group>
					}
				</Panel>
			</View>
		)
	}
}
