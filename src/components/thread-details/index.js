import { Component } from 'preact'

import CustomFields from '../custom-fields'

export default class ThreadDetails extends Component {
	constructor(props) {
		super(props)
		this.state = {
			meta: { ...props.thread.details, ...(props.thread.meta||{}) },
			ignoreInCustomFields: ['name', 'name-lowercase', 'creation-date', 'creator-entity-id', 'type', 'type_v4']
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

	render({ updateThreadMeta }) {
		return (
			<div>
				<div class="row">
					<div class="columns six">
						<h2>{this.state.meta.name}</h2>
					</div>
					<div class="columns three">
						<input class="u-full-width" type="button" value="Delete Room" />
					</div>
					<div class="columns three">
						<input class="u-full-width button-primary" type="button" value="Update Room" onClick={ev => updateThreadMeta(this.state.meta)} />
					</div>
				</div>
				<div class="row">
					<label for="name">Name</label>
					<input class="u-full-width" type="text" id="name" value={this.state.meta.name} onInput={this.handleMetaInput.bind(this)} />
				</div>
				<CustomFields fields={this.state.meta}
					onUpdate={this.customMetaUpdated.bind(this)}
					ignoreFields={this.state.ignoreInCustomFields} />
			</div>
		)
	}
}
