import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const inputState = {
	filter_key: 'name'
}

const handleInputChange = ev => {
	inputState[ev.target.id] = ev.target.value
}

const Users = ({ users, loadUsersCallback, filtering }) => (
	<div class={style.users}>
		<div class="row">
			<div class="columns three">
				<input class={'u-full-width' + (filtering ? '' : ' button-primary')} type="button" value="All Users" onClick={ev => loadUsersCallback()} />
			</div>
			<div class="columns two">
				<select class="u-full-width" id="filter_key" value={inputState.filter_key} onChange={handleInputChange}>
					<option value="uid">User ID</option>
					<option value="name">Name</option>
					<option value="email">Email</option>
					<option value="phone">Phone</option>
					<option value="country-code">Country</option>
					<option value="location">Location</option>
				</select>
			</div>
			<div class="columns five">
				<input class="u-full-width" id="filter_value" type="text" onChange={handleInputChange} />
			</div>
			<div class="columns two">
				<input class={'u-full-width' + (filtering ? ' button-primary' : '')} type="button" value="Filter" onClick={ev => loadUsersCallback(inputState.filter_key, inputState.filter_value)} />
			</div>
		</div>
		<ul>
			{Object.values(users).map(user => {
				return <li>{user.meta.name + ' | ' + user.meta.email + ' | ' + user.meta.phone + ' | ' + user.meta.location + ' | ' + user.meta['country-code']}</li>
			})}
		</ul>
	</div>
)

export default Users
