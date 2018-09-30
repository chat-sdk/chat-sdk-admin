import { Component } from 'preact'

import style from './style'

import CustomFields from '../custom-fields'

export default class UserDetails extends Component {
	constructor(props) {
		super(props)
		this.state = {
			meta: props.user.meta,
			ignoreInCustomFields: ['name', 'name-lowercase', 'status', 'email', 'phone', 'location', 'country-code', 'pictureURL', 'pushToken']
		}
	}

	handleMetaInput(ev) {
		const meta = this.state.meta
		meta[ev.target.id] = ev.target.value
		if (ev.target.id === 'name') {
			meta['name-lowercase'] = ev.target.value.toLowerCase()
		}
		this.setState({ meta })
	}

	customMetaUpdated(meta) {
		this.setState({ meta })
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
						<input class="u-full-width" type="text" id="status" value={this.state.meta.status} onChange={this.handleMetaInput.bind(this)} />
					</div>
				</div>
				<div class="row">
					<div class="columns six">
						<label for="email">Email</label>
						<input class="u-full-width" type="text" id="email" value={this.state.meta.email} onChange={this.handleMetaInput.bind(this)} />
					</div>
					<div class="columns six">
						<label for="phone">Phone</label>
						<input class="u-full-width" type="text" id="phone" value={this.state.meta.phone} onChange={this.handleMetaInput.bind(this)} />
					</div>
				</div>
				<div class="row">
					<div class="columns six">
						<label for="location">Location</label>
						<input class="u-full-width" type="text" id="location" value={this.state.meta.location} onChange={this.handleMetaInput.bind(this)} />
					</div>
					<div class="columns six">
						<label for="country-code">Country Code</label>
						<input class="u-full-width" type="text" id="country-code" value={this.state.meta['country-code']} onChange={this.handleMetaInput.bind(this)} />
					</div>
				</div>
			</div>
		)
	}

	render({ updateUserMeta }) {
		return (
			<div class={style.user_details}>
				<div class="row">
					<div class="columns six">
						<h2>{this.state.meta.name || this.state.meta.email }</h2>
					</div>
					<div class="columns three">
						<input class="u-full-width" type="button" value="Delete User" />
					</div>
					<div class="columns three">
						<input class="u-full-width button-primary" type="button" value="Update User" onClick={ev => updateUserMeta(this.state.meta)} />
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
