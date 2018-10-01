import { h, Component } from 'preact'

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

export default class Dashboard extends Component {
	state = {
		backend: localStorage.getItem('backend'),
		selectedTab: localStorage.getItem('selectedTab') || 'users',
		selectedUser: localStorage.getItem('selectedUser'),
		selectedThread: localStorage.getItem('selectedThread')
	}

	handleBackendInput(ev) {
		this.setState({ backend: ev.target.value })
	}

	async loadUsers(update = true) {
		console.log('Dashboard: loadUsers()')
		try {
			const response = await api.fetchUsers()
			const users = await response.json()
			const filteredUsersData = this.getFilteredUsers(users, this.state.filterIndex, this.state.filterQuery)
			if (update) {
				this.setState({ users, ...filteredUsersData })
			}
			return { users, ...filteredUsersData }
		} catch (err) {
			if (update) {
				this.setState({ users: null })
				console.error(err)
			} else throw err
		}
	}

	async loadPublicThreads(update = true) {
		console.log('Dashboard: loadPublicThreads()')
		try {
			const usersData = await this.loadUsers(false)
			const response = await api.fetchPublicThreads()
			const publicThreads = await response.json()
			const filterdThreadsData = await this.getFilteredPublicThreads(publicThreads, this.state.filterQuery)
			if (update) {
				this.setState({ ...usersData, publicThreads, ...filterdThreadsData })
			}
			return { ...usersData, publicThreads, ...filterdThreadsData }
		} catch (err) {
			if (update) {
				this.setState({ publicThreads: null })
				console.error(err)
			} else throw err
		}
	}

	async loadFlaggedMessages(update = true) {
		console.log('Dashboard: loadFlaggedMessages()')
		try {
			const usersData = await this.loadUsers(false)
			const response = await api.fetchFlaggedMessages()
			const flaggedMessages = await response.json()
			const filterdMessagesData = await this.getFilteredFlaggedMessages(flaggedMessages, this.state.filterSenderQuery, this.state.filterMessageQuery)
			const data = { ...usersData, flaggedMessages, ...filterdMessagesData }
			if (update) this.setState(data)
			return data
		} catch (err) {
			if (update) {
				this.setState({ flaggedMessages: null })
				console.error(err)
			} else throw err
		}
	}

	loadData() {
		localStorage.setItem('backend', this.state.backend || '')
		api.init(this.state.backend)
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

	getFilteredUsers(users, index, query) {
		if (users && query) {
			const uids = Object.keys(users).filter(uid => {
				if (index === 'uid') return this.isMatch(uid, query)
				else return this.isMatch((users)[uid].meta[index], query)
			})
			return {
				filteredUsers: this.reduceKeysToObjects(uids, users),
				filterIndex: index,
				filterQuery: query
			}
		}
		return { filteredUsers: null, filterIndex: null, filterQuery: null }
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
				filteredPublicThreads: this.reduceKeysToObjects(tids, publicThreads),
				filterQuery: query
			}
		}
		return { filteredPublicThreads: null, filterQuery: null }
	}

	getFilteredFlaggedMessages(flaggedMessages, senderQuery, messageQuery) {
		if (flaggedMessages && (senderQuery || messageQuery)) {
			let mids = Object.keys(flaggedMessages)
			if (senderQuery) {
				mids = mids.filter(mid => {
					const message = flaggedMessages[mid]
					const user = this.state.users[message['sender-entity-id']]
					return user && this.isMatch(user.meta.name, senderQuery)
				})
			}
			if (messageQuery) {
				mids = mids.filter(mid => this.isMatch(flaggedMessages[mid].message, messageQuery))
			}
			return {
				filteredFlaggedMessages: this.reduceKeysToObjects(mids, flaggedMessages),
				filterSenderQuery: senderQuery,
				filterMessageQuery: messageQuery
			}
		}
		return { filteredFlaggedMessages: null, filterSenderQuery: null, filterMessageQuery: null }
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

	componentDidMount() {
		if (this.state.backend) {
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
					return <PublicThreads threads={this.state.filteredPublicThreads || this.state.publicThreads}
						filterThreads={this.filterPublicThreads.bind(this)}
						selectThread={this.selectThread.bind(this)}
						refresh={this.loadPublicThreads.bind(this)} />
				}
			case 'moderation':
				if (this.state.flaggedMessages) {
					if (this.state.users) {
						return <Moderation messages={this.state.filteredFlaggedMessages || this.state.flaggedMessages}
							users={this.state.users}
							filterMessages={this.filterFlaggedMessages.bind(this)}
							unflagMessage={api.unflagMessage.bind(this)}
							deleteMessage={api.deleteFlaggedMessage.bind(this)}
							refresh={this.loadFlaggedMessages.bind(this)} />
					} else {
						return <div>Loading...</div>
					}
				} else {
					return <div>No flagged messages found</div>
				}
			default:
				return <div />
		}
	}

	render() {
		// if (!firebase.auth().currentUser) route('/signin')
		console.log('Dashboard: render()')
		return (
			<div class={style.dashboard}>
				<label for="backend">API Backend</label>
				<div class="row">
					<div class="ten columns">
						<input class="u-full-width" type="text" id="backend" value={this.state.backend} onChange={this.handleBackendInput.bind(this)} />
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
