import { h, Component } from 'preact'
import { route } from 'preact-router'

import style from './style'

import Users from '../../components/users'
import PublicRooms from '../../components/public-rooms'
import Moderation from '../../components/moderation'

const inputState = {
	backend: localStorage.getItem('backend')
}

export default class Dashboard extends Component {
	state = {
		users: {},
		selectedTab: 'users'
	}

	handleInputChange(ev) {
		inputState[ev.target.id] = ev.target.value
	}

	loadUsers(key, value) {
		console.log('loadUsers:', key, value)

		if (key !== undefined && value !== undefined) {
			return fetch(inputState.backend + '/users/by/' + key + '/' + value)
				.then(data => data.json())
				.then(data => this.setState({ users: data, filtering: true }))
		} else {
			return fetch(inputState.backend + '/users')
				.then(data => data.json())
				.then(data => this.setState({ users: data, filtering: false }))
		}
	}

	loadPublicRooms() {
		return fetch(inputState.backend + '/public-threads')
			.then(data => data.json())
			.then(data => this.setState({ public_threads: data }))
	}

	loadData() {
		localStorage.setItem('backend', inputState.backend)
		if (this.state.selectedTab === 'users') {
			this.loadUsers().catch(console.error)
		}
		if (this.state.selectedTab === 'public-rooms') {
			this.loadPublicRooms().catch(console.error)
		}
		if (this.state.selectedTab === 'moderation') {
			
		}
	}

	activateTab(ev) {
		this.setState({ selectedTab: ev.target.dataset.tab })
		this.loadData()
	}

	componentDidMount() {
		if (inputState.backend) {
			this.loadData()
		}
	}

	renderTab(title, value) {
		return (<input class={'u-full-width' + (this.state.selectedTab === value ? ' button-primary' : '')}
			type="button" data-tab={value} value={title}
			onClick={this.activateTab.bind(this)} />)
	}

	renderTabBar() {
		return (
			<div class="row">
				<div class="columns four">
					{this.renderTab('Users', 'users')}
				</div>
				<div class="columns four">
					{this.renderTab('Public Rooms', 'public-rooms')}
				</div>
				<div class="columns four">
					{this.renderTab('Moderation', 'moderation')}
				</div>
			</div>
		)
	}

	renderComponentForTab(tab) {
		switch (tab) {
			case 'users':
				return <Users users={this.state.users}
					loadUsersCallback={this.loadUsers.bind(this)}
					filtering={this.state.filtering} />
			case 'public-rooms':
				return <PublicRooms />
			case 'moderation':
				return <Moderation />
			default:
				return <div />
		}
	}

	render() {
		// if (!firebase.auth().currentUser) route('/signin')
		return (
			<div class={style.dashboard}>
				<label for="backend">API Backend</label>
				<div class="row">
					<div class="ten columns">
						<input class="u-full-width" type="text" id="backend" value={inputState.backend} onChange={this.handleInputChange.bind(this)} />
					</div>
					<div class="two columns">
						<input class="u-full-width  button-primary" type="button" value="Load" onClick={this.loadData.bind(this)} />
					</div>
				</div>
				{this.renderTabBar.bind(this)()}
				{this.renderComponentForTab(this.state.selectedTab)}
			</div>
		)
	}
}
