import React from 'react';
import {
	Panel,
	PanelHeader,
	FormLayout,
	Select,
	Input,
	Tabs,
	TabsItem,
	Group,
	FormItem,
	CustomSelectOption,
	Header,
	CellButton,
	Button,
	Checkbox,
	Snackbar,
	Alert
} from '@vkontakte/vkui';
import { Icon28AddOutline, Icon28DeleteOutline } from '@vkontakte/icons';
import Grid from "./Grid";
import './Tournament.scss';
import {localStorage} from "@vkontakte/vkjs";
import html2canvas from "html2canvas";


const MemberCell = (props) => (
	<FormLayout className={'MemberCell'}>
		<Button mode={'tertiary'} onClick={props.delMember}>
			<Icon28DeleteOutline/>
		</Button>
		<FormItem>
			<Input type={'number'} placeholder={'Рейтинг'} value={props.rating} onChange={(e) => props.onRatingChange(e, props.i)}/>
		</FormItem>
		<FormItem>
			<Input placeholder={'Наименование'} value={props.name} onChange={(e) => props.onNameChange(e, props.i)}/>
		</FormItem>
	</FormLayout>
)


export default class Tournament extends React.Component {
	constructor(props) {
		super(props);
		this.state = !this.props.globalState.panels.edit.activeTab ? {
			activeTab: 'edit',
			titleErr: false,
			snackbar: null,
			members: [],
			title: '',
			type: '',
			sow: true,
			id: '',
		} : this.props.globalState.panels.edit;
	}

	share = () => {
		if (this.state.uid) {
			navigator.clipboard.writeText('https://host.adawhite.ru/final/web/#' + this.state.uid).then(() => {
				this.setState({snackbar:
					<Snackbar onClose={() => this.setState({snackbar: null})}>
						Ссылка скопирована
					</Snackbar>
				})
			})
		} else {
			this.setState({snackbar:
					<Snackbar onClose={() => this.setState({snackbar: null})}>
						Сначала сохраните сценарий
					</Snackbar>
			})
		}
	}

	componentWillUnmount() {
		this.props.setGlobalState({panels: {edit: {...this.state, snackbar: null}}});
	}

	resetMembers = () => {
		let members = [];
		this.state.members.forEach(item => {
			members.push({rating: item.rating, name: item.name, key: item.key, wins: []})
		})
		this.setState({members: members});
	}

	onTypeChange = (e) => {
		this.setState({type: e.target.value}, this.resetMembers);
	}

	onTitleChange = (e) => {
		this.setState({title: e.target.value, titleErr: false})
	}

	addMember = () => {
		this.setState({members: [...this.state.members, {rating: '', name: '', key: Math.random(), wins: [], doublewins: []}]}, this.resetMembers)
	}

	delMember = (i) => {
		let members = this.state.members;
		members.splice(i, 1);
		this.setState({members: members}, this.resetMembers)
	}

	onNameChange = (e, i) => {
		let members = this.state.members;
		members[i]['name'] = e.target.value;
		this.setState({members: members});
	}

	onRatingChange = (e, i) => {
		let members = this.state.members;
		members[i]['rating'] = e.target.value;
		this.setState({members: members}, this.resetMembers);
	}

	onSowChange = () => {
		this.setState({sow: !this.state.sow}, this.resetMembers);
	}

	toggleWinner = (index, round, pair) => {
		let members = this.state.members;
		members[index]['wins'][round] = !members[index]['wins'][round];
		for (let i=round;i<Math.log(members.length) / Math.log(2);i++) {
			members[pair]['wins'][i] = false;
		}
		this.setState({members: members});
	}

	saveGrid = () => {
		if (!this.state.uid) {
			let params = {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...this.state, snackbar: null})};
			fetch('https://websocket.adawhite.ru/grids/', params).then(resp => {
				if (resp.ok) {
					resp.json().then(data => {
						if (data.uid) {
							this.setState({uid: data.uid}, this.save);
						}
					})
				}
			})
		} else {
			let params = {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...this.state, snackbar: null})};
			fetch('https://websocket.adawhite.ru/grids/' + this.state.uid, params).then(resp => {
				if (resp.ok) {
					resp.json().then(data => {
						this.save()
					})
				}
			})
		}
	}

	save = () => {
		let grids = localStorage.getItem('grids');
		grids = grids ? JSON.parse(grids) : {}
		grids[this.state.uid] = {...this.state, snackbar: null};
		localStorage.setItem('grids', JSON.stringify(grids));

		this.setState({
			snackbar:
				<Snackbar onClose={() => this.setState({snackbar: null})}>
					Сохранение завершено.
				</Snackbar>
		})
	}

	newGrid = () => {
		this.setState({
			activeTab: 'edit',
			titleErr: false,
			snackbar: null,
			members: [],
			title: '',
			type: '',
			sow: true,
			id: '',
		})
	}

	shareRound = (data) => {
		this.props.setPopout(
			<Alert header={'Поделиться матчем'} onClose={() => this.props.setPopout(null)} actions={[
				{
					title: 'Скачать',
					action: () => {
						html2canvas(document.getElementById('MatchResults')).then(canvas => {
							let link = document.createElement('a');
							link.download = 'results.png';
							link.href = canvas.toDataURL();
							link.click();
						});
					}
				}, {
				title: 'Отмена',
				autoclose: true,
				mode: 'cancel'
			}]}>
				<div id={'MatchResults'}>
					<div className={'MatchResults'}>
						<div>
							Ничоси! Сегодня соревнуются команды <span className={'Team'}>«{data[0]['name']}»</span> и <span className={'Team'}>«{data[1]['name']}»</span>. Давно такого не было!
						</div>
					</div>
				</div>
			</Alert>
		)
	}

	render() {
		const options = [
			{value: 'olympic', label: 'Олимпийская'},
			{value: 'double', label: 'C выбыванием после двух поражений'},
			{value: 'swiss', label: 'Швейцарская'}
		];

		return (
			<Panel id={this.props.id}>
				<PanelHeader>Текущая сетка</PanelHeader>
				<Group>
					<Tabs>
						<TabsItem
							onClick={() => this.setState({ activeTab: 'edit' })}
							selected={this.state.activeTab === 'edit'}
						>
							Редактирование
						</TabsItem>
						<TabsItem
							onClick={() => this.setState({ activeTab: 'observe' })}
							selected={this.state.activeTab === 'observe'}
						>
							Просмотр
						</TabsItem>
					</Tabs>
				</Group>
				{
					this.state.activeTab === 'edit' ?
						<>
							<Group>
								<FormLayout>
									<FormItem top={'Название турнира'}>
										<Input placeholder={'Чемпионат по FIFA'} value={this.state.title} onChange={this.onTitleChange}/>
									</FormItem>

									<FormItem top={'Тип таблицы'}>
										<Select options={options} renderOption={({ option, ...restProps }) => (
											<CustomSelectOption {...restProps}/>
										)} placeholder={'Не выбрано'} value={this.state.type} onChange={this.onTypeChange}/>
									</FormItem>

									<FormItem>
										<Checkbox checked={this.state.sow} onChange={this.onSowChange}>
											Сеять участников автоматически
										</Checkbox>
									</FormItem>
								</FormLayout>
							</Group>

							<Group header={<Header>Участники турнира</Header>}>
								{
									this.state.members.map((item, i) => {
										return (
											<MemberCell {...item} key={item.key} delMember={() => this.delMember(i)} i={i}
														onNameChange={this.onNameChange} onRatingChange={this.onRatingChange}/>
										)
									})
								}
								<CellButton before={<Icon28AddOutline/>} onClick={this.addMember} disabled={this.state.members.length >= 16}>
									Добавить участника
								</CellButton>
							</Group>

							<Group>
								<div className={'Editor-controls'}>
									<Button size={'l'} mode={'destructive'} stretched onClick={this.newGrid}>Новая сетка</Button>
									<Button size={'l'} stretched onClick={this.saveGrid}>Сохранить сетку</Button>
								</div>
							</Group>
						</>
						:
						<>
							<Group>
								<Grid {...this.state} {...this.props} toggleWinner={this.toggleWinner} shareRound={this.shareRound}/>
							</Group>
							<Group>
								<Button size={'l'} stretched onClick={this.share}>Поделиться</Button>
							</Group>
						</>
				}
				{this.state.snackbar}
			</Panel>
		)
	}
}