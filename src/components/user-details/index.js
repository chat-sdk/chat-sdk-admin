import { Component } from 'preact'

import style from './style'
import { isEqual, clone } from '../../lib/utils'

import LoadingButton from '../loading-button'
import CustomFields from '../custom-fields'

export default class UserDetails extends Component {
	constructor(props) {
		super(props)
		this.state = {
			meta: clone(props.user.meta),
			ignoreInCustomFields: ['name', 'name-lowercase', 'status', 'email', 'phone', 'location', 'country-code', 'pictureURL', 'pushToken']
		}
	}

	handleMetaInput(ev) {
		const meta = clone(this.state.meta)
		meta[ev.target.id] = ev.target.value
		if (ev.target.id === 'name') {
			meta['name-lowercase'] = ev.target.value.toLowerCase()
		}
		this.setState({ meta })
	}

	customMetaUpdated(meta) {
		if (!isEqual(meta, this.state.meta)) {
			this.setState({ meta })
		}
	}

	renderMeta() {
		return (
			<div>
				<div class="row">
					<div class="columns six">
						<label for="name">Name</label>
						<input class="u-full-width" type="text" id="name" value={this.state.meta.name} onInput={this.handleMetaInput.bind(this)} />
					</div>
					<div class="columns six">
						<label for="status">Status</label>
						<input class="u-full-width" type="text" id="status" value={this.state.meta.status} onInput={this.handleMetaInput.bind(this)} />
					</div>
				</div>
				<div class="row">
					<div class="columns six">
						<label for="email">Email</label>
						<input class="u-full-width" type="text" id="email" value={this.state.meta.email} onInput={this.handleMetaInput.bind(this)} />
					</div>
					<div class="columns six">
						<label for="phone">Phone</label>
						<input class="u-full-width" type="text" id="phone" value={this.state.meta.phone} onInput={this.handleMetaInput.bind(this)} />
					</div>
				</div>
				<div class="row">
					<div class="columns six">
						<label for="location">Location</label>
						<input class="u-full-width" type="text" id="location" value={this.state.meta.location} onInput={this.handleMetaInput.bind(this)} />
					</div>
					<div class="columns six">
						<label for="country-code">Country Code</label>
						<input class="u-full-width" type="text" id="country-code" value={this.state.meta['country-code']} onInput={this.handleMetaInput.bind(this)} />
					</div>
				</div>
				<div class="row">
					<label for="pictureURL">Avatar URL</label>
					<input class="u-full-width" type="text" id="pictureURL" value={this.state.meta.pictureURL} onInput={this.handleMetaInput.bind(this)} />
				</div>
			</div>
		)
	}

	render({ updateUserMeta, loading }) {
		const avatar = this.state.meta.pictureURL
		return (
			<div class={style.user_details}>
				<div class="row">
					<div class="columns six">
						<h3 class={style.user_heading}>
							{avatar && <img class={style.user_avatar} src={avatar} />}
							<span class={style.user_title}>
								{this.state.meta.name || this.state.meta.email }
							</span>
						</h3>
					</div>
					<div class="columns three">
						<input class='u-full-width delete-button' type="button" value="Delete User" />
					</div>
					<div class="columns three">
						<LoadingButton title="Update User" onClick={ev => updateUserMeta(this.state.meta)} loading={loading}
							disabled={isEqual(this.props.user.meta, this.state.meta)} />
					</div>
				</div>
				{this.renderMeta()}
				<CustomFields fields={this.state.meta}
					onUpdate={this.customMetaUpdated.bind(this)}
					ignoreFields={this.state.ignoreInCustomFields} />
			</div>
		)
	}
}
