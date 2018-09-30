import { h, Component } from 'preact'

import style from './style'
import api from '../../lib/api'

import Users from '../../components/users'
import UserDetails from '../../components/user-details'
import PublicThreads from '../../components/public-threads'
import ThreadDetails from '../../components/thread-details'
import Moderation from '../../components/moderation'

const inputState = {
	backend: localStorage.getItem('backend')
}

export default class Dashboard extends Component {
	state = {
		selectedTab: localStorage.getItem('selectedTab') || 'users',

		users: null,
		selectedUser: localStorage.getItem('selectedUser'),
		filteredUsers: null,
		filterIndex: null,
		filterValue: null,

		publicThreads: null,
		selectedThread: localStorage.getItem('selectedThread'),
		filteredThreads: null,

		flaggedMessages: null,
		filteredMessages: null,
		filterUser: null,
		filterMessage: null
	}

	handleInputChange(ev) {
		inputState[ev.target.id] = ev.target.value
	}

	loadUsers() {
		return api.fetchUsers()
			.then(data => data.json())
			.then(data => this.setState({ users: data }))
			.then(this.filterUsers(this.state.filterIndex, this.state.filterValue))
			.catch(err => this.setState({ users: null }))
	}

	loadPublicThreads() {
		return this.loadUsers()
			.then(() => api.fetchPublicThreads())
			.then(data => data.json())
			.then(data => this.setState({ publicThreads: data }))
			.then(this.filterPublicThreads(this.state.filterThread))
			.catch(err => this.setState({ publicThreads: null }))
	}

	loadFlaggedMessages() {
		return this.loadUsers()
			.then(() => api.fetchFlaggedMessages())
			.then(data => data.json())
			.then(data => this.setState({ flaggedMessages: data }))
			.then(this.filterFlaggedMessages(this.state.filterUser, this.state.filterMessage))
			.catch(err => this.setState({ flaggedMessages: null }))
	}

	loadData() {
		localStorage.setItem('backend', inputState.backend)
		api.init(inputState.backend)
		if (this.state.selectedTab === 'users') {
			this.loadUsers().catch(console.error)
		}
		if (this.state.selectedTab === 'public-threads') {
			this.loadPublicThreads().catch(console.error)
		}
		if (this.state.selectedTab === 'moderation') {
			this.loadFlaggedMessages().catch(console.error)
		}
	}

	activateTab(ev) {
		localStorage.setItem('selectedTab', ev.target.dataset.tab)
		localStorage.setItem('selectedUser', '')
		localStorage.setItem('selectedThread', '')
		this.setState({ selectedTab: ev.target.dataset.tab, selectedUser: null, selectedThread: null })
		this.loadData()
	}

	selectUser(uid) {
		localStorage.setItem('selectedUser', uid)
		this.setState({ selectedUser: uid })
	}

	selectThread(tid) {
		localStorage.setItem('selectedThread', tid)
		this.setState({ selectedThread: tid })
	}

	async updateUserMeta(meta) {
		await api.setUserMeta(this.state.selectedUser, meta)
		return this.loadUsers()
	}

	async updateThreadMeta(meta) {
		await api.setThreadMeta(this.state.selectedThread, meta)
		return this.loadPublicThreads()
	}

	isMatch(a, b) {
		return (a || '').toLowerCase().match((b || '').toLowerCase())
	}

	reduceKeysToObjects(keys, objs) {
		return keys.reduce((o, k) => (o[k] = objs[k], o), {})
	}

	getFilteredUsers(index, filter) {
		let uids = Object.keys(this.state.users || {})
		if (filter && uids.length > 0) {
			uids = uids.filter(uid => {
				if (index === 'uid') return this.isMatch(uid, filter)
				else return this.isMatch(this.state.users[uid].meta[index], filter)
			})
			return this.reduceKeysToObjects(uids, this.state.users)
		} else {
			return null
		}
	}

	filterUsers(index, filter) {
		const filteredUsers = this.getFilteredUsers(index, filter)
		if (filteredUsers) {
			this.setState({ filteredUsers, filterIndex: index, filterValue: filter })
		} else {
			this.setState({ filteredUsers: null, filterIndex: null, filterValue: null })
		}
	}

	filterFlaggedMessages(senderFilter, messageFilter) {
		let mids = Object.keys(this.state.flaggedMessages || {})
		if ((senderFilter || messageFilter) && mids.length > 0) {
			if (senderFilter) {
				mids = mids.filter(mid => {
					const message = this.state.flaggedMessages[mid]
					const user = this.state.users[message['sender-entity-id']]
					return user && this.isMatch(user.meta.name, senderFilter)
				})
			}
			if (messageFilter) {
				mids = mids.filter(mid => this.isMatch(this.state.flaggedMessages[mid].message, messageFilter))
			}
			const filteredMessages = this.reduceKeysToObjects(mids, this.state.flaggedMessages)
			this.setState({ filteredMessages, filterUser: senderFilter, filterMessage: messageFilter })
		} else {
			this.setState({ filteredMessages: null, filterUser: null, filterMessage: null })
		}
	}

	filterPublicThreads(filter) {
		let tids = Object.keys(this.state.publicThreads || {})
		if (filter && tids.length > 0) {
			tids = tids.filter(tid => {
				const thread = this.state.publicThreads[tid]
				if (thread.meta && thread.meta.name) {
					return this.isMatch(thread.meta.name, filter)
				} else {
					return this.isMatch(thread.details.name, filter)
				}
			})
			const filteredThreads = this.reduceKeysToObjects(tids, this.state.publicThreads)
			this.setState({ filteredThreads, filterThread: filter })
		} else {
			this.setState({ filteredThreads: null, filterThread: null })
		}
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
					{this.renderTab('Public Rooms', 'public-threads')}
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
				if (this.state.selectedUser) {
					if (this.state.users) {
						const user = this.state.users[this.state.selectedUser]
						return <UserDetails user={user}
							updateUserMeta={this.updateUserMeta.bind(this)} />
					} else {
						return <div>Loading...</div>
					}
				} else {
					return <Users users={this.state.filteredUsers || this.state.users}
						filterUsers={this.filterUsers.bind(this)}
						selectUser={this.selectUser.bind(this)}
						refresh={this.loadUsers.bind(this)} />
				}
			case 'public-threads':
				if (this.state.selectedThread) {
					if (this.state.publicThreads) {
						const thread = this.state.publicThreads[this.state.selectedThread]
						return <ThreadDetails thread={thread}
							updateThreadMeta={this.updateThreadMeta.bind(this)} />
					} else {
						return <div>Loading...</div>
					}
				} else {
					return <PublicThreads threads={this.state.filteredThreads || this.state.publicThreads}
						filterThreads={this.filterPublicThreads.bind(this)}
						selectThread={this.selectThread.bind(this)}
						refresh={this.loadPublicThreads.bind(this)} />
				}
			case 'moderation':
				return <Moderation messages={this.state.filteredMessages || this.state.flaggedMessages}
					users={this.state.users}
					filterMessages={this.filterFlaggedMessages.bind(this)}
					unflagMessage={api.unflagMessage.bind(this)}
					deleteMessage={api.deleteFlaggedMessage.bind(this)}
					refresh={this.loadFlaggedMessages.bind(this)} />
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
				<div class={style.widget}>
					{this.renderComponentForTab(this.state.selectedTab)}
				</div>
			</div>
		)
	}
}
