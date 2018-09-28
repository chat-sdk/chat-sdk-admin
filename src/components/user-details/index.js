import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const userMeta = {}

const handleInputChange = ev => {
	userMeta[ev.target.id] = ev.target.value
}

const UserDetails = ({ user, updateUserMeta }) => {
	if (!user) return <div class={style.user_details}></div>
	userMeta.name = user.meta.name
	userMeta.status = user.meta.status
	userMeta.email = user.meta.email
	userMeta.phone = user.meta.phone
	userMeta.location = user.meta.location
	userMeta['country-code'] = user.meta['country-code']
	return (
		<div class={style.user_details}>
			<div class="row">
				<div class="columns six">
					<h2>{user.meta.name || user.meta.email }</h2>
				</div>
				<div class="columns three">
					<input class="u-full-width" type="button" value="Delete User" />
				</div>
				<div class="columns three">
					<input class="u-full-width button-primary" type="button" value="Update User" onClick={ev => updateUserMeta(userMeta)} />
				</div>
			</div>
			<div class="row">
				<div class="columns six">
					<label for="name">Name</label>
					<input class="u-full-width" type="text" id="name" value={user.meta.name} onChange={handleInputChange} />
				</div>
				<div class="columns six">
					<label for="status">Status</label>
					<input class="u-full-width" type="text" id="status" value={user.meta.status} onChange={handleInputChange} />
				</div>
			</div>
			<div class="row">
				<div class="columns six">
					<label for="email">Email</label>
					<input class="u-full-width" type="text" id="email" value={user.meta.email} onChange={handleInputChange} />
				</div>
				<div class="columns six">
					<label for="phone">Phone</label>
					<input class="u-full-width" type="text" id="phone" value={user.meta.phone} onChange={handleInputChange} />
				</div>
			</div>
			<div class="row">
				<div class="columns six">
					<label for="location">Location</label>
					<input class="u-full-width" type="text" id="location" value={user.meta.location} onChange={handleInputChange} />
				</div>
				<div class="columns six">
					<label for="country-code">Country Code</label>
					<input class="u-full-width" type="text" id="country-code" value={user.meta['country-code']} onChange={handleInputChange} />
				</div>
			</div>
		</div>
	)
}

export default UserDetails
