import { Link } from 'preact-router/match'

import style from './style'

const filterOptions = {
	uid: 'User ID',
	name: 'Name',
	email: 'Email',
	phone: 'Phone',
	location: 'Location',
	'country-code': 'Country'
}

const filterState = {
	key: 'name',
	value: null
}

const getFlagURL = code => {
	return 'https://www.countryflags.io/' + code + '/flat/64.png'
}

const handleFilterInput = filterUsers => ev => {
	filterState[ev.target.dataset.filter] = ev.target.value
	filterUsers(filterState.key, filterState.value)
}

const renderUsersList = (users, selectUser) => {
	const uids = Object.keys(users || {})
	if (uids.length > 0) {
		return uids.map(uid => {
			const avatar = users[uid].meta.pictureURL
			const country = users[uid].meta['country-code']
			const flag = getFlagURL(country)
			return (
				<li class={style.users_list_item}>
					{ avatar ? <img class={style.user_avatar} src={avatar} /> : <div class={style.user_avatar}/> }
					<span>{users[uid].meta.name || users[uid].meta.email || uid}</span>
					<span>{users[uid].meta.location}</span>
					<span class={style.users_list_right}>
						<Link href="#">uid</Link>
						<Link href="#" onClick={ev => selectUser(uid)}>edit</Link>
						<Link href="#">delete</Link>
						{ country ? <img class={style.country_flag} src={flag} /> : <div class={style.country_flag} /> }
					</span>
				</li>
			)
		})
	} else {
		return <li>No users found!</li>
	}
}

const Users = ({ users, filterUsers, selectUser, refresh }) => (
	<div>
		<div class="row">
			<div class="columns three">
				<select class="u-full-width" data-filter="key" value={filterState.key} onChange={handleFilterInput(filterUsers)}>
					{Object.keys(filterOptions).map(key => {
						return <option value={key}>{filterOptions[key]}</option>
					})}
				</select>
			</div>
			<div class="columns six">
				<input class="u-full-width" data-filter="value" type="text" placeholder={'Any ' + filterOptions[filterState.key]} value={filterState.value} onInput={handleFilterInput(filterUsers)} />
			</div>
			<div class="columns three">
				<input class="u-full-width button-primary" type="button" value="Refresh" onClick={refresh} />
			</div>
		</div>
		<ul class={style.users_list}>
			{renderUsersList(users, selectUser)}
		</ul>
	</div>
)

export default Users
