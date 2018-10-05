import { h, Component } from 'preact'
import { Router, route } from 'preact-router'

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
		backend: localStorage.getItem('backend')
	}

	handleBackendInput(ev) {
		this.setState({ backend: ev.target.value })
	}

	async loadUsers(update = true) {
		console.log('Dashboard: loadUsers()')
		try {
			const response = await api.fetchUsers()
			const users = await response.json()
			const filteredUsersData = this.getFilteredUsers(users, this.state.filterUserIndex, this.state.filterUserQuery)
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
			const filterdThreadsData = await this.getFilteredPublicThreads(publicThreads, this.state.filterThreadQuery)
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
			const filterdMessagesData = await this.getFilteredFlaggedMessages(flaggedMessages, this.state.filterMessageSenderQuery, this.state.filterMessageValueQuery)
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
		if (!this.props.tab) {
			const selectedTab = localStorage.getItem('selectedTab')
			if (selectedTab) route('/' + selectedTab)
			else route('/' + tabs.users)
		}
		api.init(this.state.backend)
		if (this.props.tab === tabs.users) {
			this.loadUsers().catch(console.error)
		}
		if (this.props.tab === tabs.publicThreads) {
			this.loadPublicThreads().catch(console.error)
		}
		if (this.props.tab === tabs.flaggedMessages) {
			this.loadFlaggedMessages().catch(console.error)
		}
	}

	activateTab(ev) {
		localStorage.setItem('selectedTab', ev.target.dataset.tab)
		route('/' + ev.target.dataset.tab)
		this.loadData()
	}

	selectUser(uid) {
		route('/'+ tabs.users +'/' + uid)
		this.loadUsers()
	}

	selectPublicThread(tid) {
		route('/' + tabs.publicThreads + '/' + tid)
		this.loadPublicThreads()
	}

	deleteUser(uid) {
		return api.deleteUser(uid)
	}

	async updateUserMeta(meta) {
		await api.setUserMeta(this.props.data, meta)
		return this.loadUsers()
	}

	async updateThreadMeta(meta) {
		await api.setThreadMeta(this.props.data, meta)
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
				filteredPublicThreads: this.reduceKeysToObjects(tids, publicThreads),
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
				filteredFlaggedMessages: this.reduceKeysToObjects(mids, flaggedMessages),
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

	componentDidMount() {
		if (this.props.tab) {
			localStorage.setItem('selectedTab', this.props.tab)
		}
		if (this.state.backend) {
			this.loadData()
		}
	}

	renderTab(title, value) {
		return (<input class={'u-full-width' + (this.props.tab === value ? ' button-primary' : '')}
			type="button" data-tab={value} value={title}
			onClick={this.activateTab.bind(this)} />)
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

	renderUsers(path) {
		if (this.state.users) {
			return <Users path={path} users={this.state.filteredUsers || this.state.users}
				filterUsers={this.filterUsers.bind(this)}
				selectUser={this.selectUser.bind(this)}
				deleteUser={this.deleteUser.bind(this)}
				refresh={this.loadUsers.bind(this)} />
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderUserDetails(path) {
		if (this.state.users) {
			const user = this.state.users[this.props.matches.data]
			if (user) {
				return <UserDetails path={path} user={user}
					updateUserMeta={this.updateUserMeta.bind(this)} />
			} else {
				return <div path={path} >User not found</div>
			}
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderPublicThreads(path) {
		if (this.state.publicThreads) {
			return <PublicThreads path={path}
				threads={this.state.filteredPublicThreads || this.state.publicThreads}
				filterThreads={this.filterPublicThreads.bind(this)}
				selectThread={this.selectPublicThread.bind(this)}
				refresh={this.loadPublicThreads.bind(this)} />
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderPublicThreadDetails(path) {
		if (this.state.publicThreads) {
			const thread = this.state.publicThreads[this.props.matches.data]
			if (thread) {
				return <ThreadDetails path={path} thread={thread}
					updateThreadMeta={this.updateThreadMeta.bind(this)} />
			} else {
				return <div path={path} >Room not found</div>
			}
		} else {
			return <div path={path} >Loading...</div>
		}
	}

	renderFlaggedMessages(path) {
		if (this.state.flaggedMessages) {
			return <Moderation path={path}
				messages={this.state.filteredFlaggedMessages || this.state.flaggedMessages}
				users={this.state.users}
				filterMessages={this.filterFlaggedMessages.bind(this)}
				unflagMessage={api.unflagMessage.bind(this)}
				deleteMessage={api.deleteFlaggedMessage.bind(this)}
				refresh={this.loadFlaggedMessages.bind(this)} />
		} else {
			return <div path={path} >Loading...</div>
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
}
