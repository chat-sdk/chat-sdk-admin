import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import pickBy from 'lodash/pickBy'

import style from './style'
import api from '../../lib/api'

import Users from '../../components/users'
import UserDetails from '../../components/user-details'
import PublicThreads from '../../components/public-threads'
import ThreadDetails from '../../components/thread-details'
import Moderation from '../../components/moderation'

// Required for building project with pre-rendering supported
const localStorage = {
	setItem: (key, value) => {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(key, value)
		}
	},
	getItem: (key) => {
		if (typeof window !== 'undefined') {
			return window.localStorage.getItem(key)
		}
	}
}

const tabs = {
	users: 'users',
	publicThreads: 'public-threads',
	flaggedMessages: 'flagged-messages'
}

export default class Dashboard extends Component {
	state = {
		backend: localStorage.getItem('backend'),
		rootPath: localStorage.getItem('rootPath'),
		loading: true
	}

	handleBackendInput(ev) {
		this.setState({ backend: ev.target.value })
	}

	handleRootPathInput(ev) {
		this.setState({ rootPath: ev.target.value })
	}

	setLoading(value) {
		if (value !== this.state.loading) {
			this.setState({ loading: value })
		}
	}

	// Load Data

	loadUser(uid) {
		this.setLoading(true)
		return this.state.api.fetchUser(uid).then(user => {
			this.setState(prevState => ({
				users: { ...prevState.users, [uid]: user },
				loading: false 
			}))
		})
	}

	loadThread(tid) {
		this.setLoading(true)
		return this.state.api.fetchThread(tid).then(thread => {
			this.setState(prevState => ({
				publicThreads: { ...prevState.publicThreads, [tid]: thread },
				loading: false
			}))
		})
	}

	loadUsers(update = true) {
		if (update) this.setLoading(true)
		if (!this.state.api.isReady()) return Promise.reject(new Error('api not ready'))
		return new Promise((resolve, reject) => {
			this.state.api.fetchUsers.asObservable().subscribe(users => {
				const filteredUsersData = this.getFilteredUsers(users, this.state.filterUserIndex, this.state.filterUserQuery)
				const data = { users, ...filteredUsersData }
				if (update) this.setState({ ...data, loading: false })
				resolve(data)
			}, err => {
				if (update) this.setState({ users: null, loading: false })
				reject(err)
			})
		})
	}

	async loadPublicThreads(update = true) {
		if (update) this.setLoading(true)
		if (!this.state.api.isReady()) return Promise.reject(new Error('api not ready'))
		const usersData = await this.loadUsers(false)
		return new Promise((resolve, reject) => {
			this.state.api.fetchPublicThreads.asObservable().subscribe(publicThreads => {
				const filterdThreadsData = this.getFilteredPublicThreads(publicThreads, this.state.filterThreadQuery)
				const data = { ...usersData, publicThreads, ...filterdThreadsData }
				if (update) this.setState({ ...data, loading: false })
				resolve(data)
			}, err => {
				if (update) this.setState({ publicThreads: null, loading: false })
				reject(err)
			})
		})
	}

	async loadFlaggedMessages(update = true) {
		if (update) this.setLoading(true)
		if (!this.state.api.isReady()) return Promise.reject(new Error('api not ready'))
		const usersData = await this.loadUsers(false)
		return new Promise((resolve, reject) => {
			this.state.api.fetchFlaggedMessages.asObservable().subscribe(flaggedMessages => {
				const filterdMessagesData = this.getFilteredFlaggedMessages(flaggedMessages, this.state.filterMessageSenderQuery, this.state.filterMessageValueQuery)
				const data = { ...usersData, flaggedMessages, ...filterdMessagesData }
				if (update) this.setState({ ...data, loading: false })
				resolve(data)
			}, err => {
				if (update) this.setState({ flaggedMessages: null, loading: false })
				reject(err)
			})
		})
	}

	loadData(tab) {
		if (this.state.api.isReady()) {
			switch (tab) {
				case tabs.publicThreads:
					this.loadPublicThreads().catch(console.error)
					break;
				case tabs.flaggedMessages:
					this.loadFlaggedMessages().catch(console.error)
					break;
				default:
					this.loadUsers().catch(console.error)
					break;
			}
		} else {
			this.setState({ users: null, publicThreads: null, flaggedMessages: null, loading: false })
		}
	}

	saveBackendAndLoadData() {
		// Save backend and rootPath to localStorage
		localStorage.setItem('backend', this.state.backend || '')
		localStorage.setItem('rootPath', this.state.rootPath || '')
		// If the API was successfully initialized set the backend and rootPath
		// in case they have changed or they don't exist yet
		if (this.state.api) {
			this.state.api.setBackend(this.state.backend)
			this.state.api.setRootPath(this.state.rootPath)
		}
		// Load data for the current tab
		this.loadData(this.props.tab)
	}

	// Select

	activateTab(ev) {
		const tab = ev.target.dataset.tab
		// Save selectedTab to localStorage for next time
		localStorage.setItem('selectedTab', tab)
		// Load the selected tab	
		route('/' + tab)
		// Load data for the selectedTab
		this.loadData(tab)
	}

	selectUser(uid) {
		route('/'+ tabs.users +'/' + uid)
		this.loadUser(uid)
	}

	selectPublicThread(tid) {
		route('/' + tabs.publicThreads + '/' + tid)
		this.loadThread(tid)
	}

	deleteUser(uid) {
		return this.state.api.deleteUser(uid)
	}

	unflagMessage(mid) {
		return this.state.unflagMessage(mid)
	}

	deleteFlaggedMessage(mid) {
		return this.state.api.deleteFlaggedMessage(mid)
	}

	async updateUserMeta(meta) {
		this.setLoading(true)
		await this.state.api.setUserMeta(this.props.id, meta)
		return this.loadUser(this.props.id)
	}

	async updateThreadMeta(meta) {
		this.setLoading(true)
		await this.state.api.setThreadMeta(this.props.id, meta)
		return this.loadThread(this.props.id)
	}

	// Filtering

	isMatch(a, b) {
		return (a || '').toLowerCase().match((b || '').toLowerCase())
	}

	getFilteredUsers(users, index, query) {
		if (users && query) {
			const uids = Object.keys(users).filter(uid => {
				if (index === 'uid') return this.isMatch(uid, query)
				else return this.isMatch((users)[uid].meta[index], query)
			})
			return {
				filteredUsers: pickBy(users, (_, k) => uids.includes(k)),
				filterUserIndex: index,
				filterUserQuery: query
			}
		}
		return { filteredUsers: null, filterUserIndex: null, filterUserQuery: null }
	}

	getFilteredPublicThreads(publicThreads, query) {
		if (publicThreads && query) {
			const tids = Object.keys(publicThreads).filter(tid => {
				const thread = this.state.publicThreads[tid]
				if (thread.meta && thread.meta.name) {
					return this.isMatch(thread.meta.name, query)
				} else {
					return this.isMatch(thread.details.name, query)
				}
			})
			return {
				filteredPublicThreads: pickBy(publicThreads, (_, k) => tids.includes(k)),
				filterThreadQuery: query
			}
		}
		return { filteredPublicThreads: null, filterThreadQuery: null }
	}

	getFilteredFlaggedMessages(flaggedMessages, senderQuery, valueQuery) {
		if (flaggedMessages && (senderQuery || valueQuery)) {
			let mids = Object.keys(flaggedMessages)
			if (senderQuery) {
				mids = mids.filter(mid => {
					const message = flaggedMessages[mid]
					const user = this.state.users[message['sender-entity-id']]
					return user && this.isMatch(user.meta.name, senderQuery)
				})
			}
			if (valueQuery) {
				mids = mids.filter(mid => this.isMatch(flaggedMessages[mid].message, valueQuery))
			}
			return {
				filteredFlaggedMessages: pickBy(flaggedMessages, (_, k) => mids.includes(k)),
				filterMessageSenderQuery: senderQuery,
				filterMessageValueQuery: valueQuery
			}
		}
		return { filteredFlaggedMessages: null, filterMessageSenderQuery: null, filterMessageValueQuery: null }
	}

	filterUsers(index, query) {
		this.setState(this.getFilteredUsers(this.state.users, index, query))
	}

	filterPublicThreads(query) {
		this.setState(this.getFilteredPublicThreads(this.state.publicThreads, query))
	}

	filterFlaggedMessages(senderQuery, messageQuery) {
		this.setState(this.getFilteredFlaggedMessages(this.state.flaggedMessages, senderQuery, messageQuery))
	}

	async componentDidMount() {
		// Initialize the api and save it to the state
		this.setState({
			api: await api(this.state.backend, this.state.rootPath)
		})

		// If no tab is selected open the tab which was save to localStorage
		// Load the users tab if no tab was saved to localStorafe
		let selectedTab = this.props.tab
		if (!selectedTab) {
			selectedTab = localStorage.getItem('selectedTab') || tabs.users
			route('/' + selectedTab)
		}

		// Load the data for the selectedTab
		this.loadData(selectedTab)
	}

	renderTab(title, value) {
		return (<input class={'u-full-width' + (this.props.tab === value ? ' button-primary' : '')}
			type="button" data-tab={value} value={title}
			onClick={this.activateTab.bind(this)} />)
	}

	renderUsers(path) {
		return <Users path={path} users={this.state.filteredUsers || this.state.users}
			filterUsers={this.filterUsers.bind(this)}
			selectUser={this.selectUser.bind(this)}
			deleteUser={this.deleteUser.bind(this)}
			loading={this.state.loading}
			refresh={this.loadUsers.bind(this)} />
	}

	renderUserDetails(path) {
		if (this.state.users) {
			const user = this.state.users[this.props.id]
			if (user) {
				return <UserDetails path={path} user={user} loading={this.state.loading}
					updateUserMeta={this.updateUserMeta.bind(this)} />
			} else {
				return <div path={path} >User not found</div>
			}
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderPublicThreads(path) {
		return <PublicThreads path={path}
			threads={this.state.filteredPublicThreads || this.state.publicThreads}
			filterThreads={this.filterPublicThreads.bind(this)}
			selectThread={this.selectPublicThread.bind(this)}
			loading={this.state.loading}
			refresh={this.loadPublicThreads.bind(this)} />
	}

	renderPublicThreadDetails(path) {
		if (this.state.publicThreads) {
			const thread = this.state.publicThreads[this.props.id]
			if (thread) {
				return <ThreadDetails path={path} thread={thread} loading={this.state.loading}
					updateThreadMeta={this.updateThreadMeta.bind(this)} />
			} else {
				return <div path={path} >Room not found</div>
			}
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderFlaggedMessages(path) {
		return <Moderation path={path}
			messages={this.state.filteredFlaggedMessages || this.state.flaggedMessages}
			users={this.state.users}
			filterMessages={this.filterFlaggedMessages.bind(this)}
			unflagMessage={this.unflagMessage.bind(this)}
			deleteMessage={this.deleteFlaggedMessage.bind(this)}
			loading={this.state.loading}
			refresh={this.loadFlaggedMessages.bind(this)} />
	}

	renderBackendConfig() {
		return (
			<div>
				<div class="row">
					<div class="seven columns">
						<input class="u-full-width" type="text" id="backend" placeholder="Backend URL" value={this.state.backend} onChange={this.handleBackendInput.bind(this)} />
					</div>
					<div class="three columns">
						<input class="u-full-width" type="text" id="rootPath" placeholder="Root Path" value={this.state.rootPath} onChange={this.handleRootPathInput.bind(this)} />
					</div>
					<div class="two columns">
						<input class="u-full-width  button-primary" type="button" value="Load" onClick={this.saveBackendAndLoadData.bind(this)} />
					</div>
				</div>
			</div>
		)
	}

	renderTabBar() {
		return (
			<div class="row">
				<div class="columns four">
					{this.renderTab('Users', tabs.users)}
				</div>
				<div class="columns four">
					{this.renderTab('Public Rooms', tabs.publicThreads)}
				</div>
				<div class="columns four">
					{this.renderTab('Moderation', tabs.flaggedMessages)}
				</div>
			</div>
		)
	}

	renderContent() {
		return (
			<div>
				<div class={style.widget}>
					<Router onChange={this.handleRoute}>
						{this.renderUsers('/' + tabs.users)}
						{this.renderUserDetails('/' + tabs.users + '/:uid')}
						{this.renderPublicThreads('/' + tabs.publicThreads)}
						{this.renderPublicThreadDetails('/' + tabs.publicThreads + '/:tid')}
						{this.renderFlaggedMessages('/' + tabs.flaggedMessages)}
					</Router>
				</div>
			</div>
		)
	}

	render() {
		return (
			<div class={style.dashboard}>
				{this.renderBackendConfig()}
				{this.renderTabBar()}
				{this.renderContent()}
			</div>
		)
	}
}
