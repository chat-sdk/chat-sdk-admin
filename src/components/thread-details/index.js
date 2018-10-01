import { Component } from 'preact'

import CustomFields from '../custom-fields'

export default class ThreadDetails extends Component {
	constructor(props) {
		super(props)
		console.log('ThreadDetails:', 'init()')
		this.state = {
			meta: this.getThreadMeta(props.thread),
			ignoreInCustomFields: ['name', 'name-lowercase', 'creation-date', 'creator-entity-id', 'type', 'type_v4']
		}
	}

	getThreadMeta(thread) {
		return { ...thread.details, ...(thread.meta || {}) }
	}

	isMetaDifferent(a, b) {
		return JSON.stringify(a) !== JSON.stringify(b)
	}

	handleMetaInput(ev) {
		const meta = this.state.meta
		meta[ev.target.id] = ev.target.value
		if (ev.target.id === 'name') {
			meta['name-lowercase'] = ev.target.value.toLowerCase()
		}
		this.setState({ meta, updateEnabled: this.isMetaDifferent(meta, this.getThreadMeta(this.props.thread)) })
	}

	customMetaUpdated(meta) {
		this.setState({ meta, updateEnabled: this.isMetaDifferent(meta, this.getThreadMeta(this.props.thread)) })
	}

	render({ updateThreadMeta, thread }) {
		console.log('ThreadDetails:', 'render()')
		if (this.isMetaDifferent(this.state.meta, this.getThreadMeta(thread))) {
			console.log('meta is different:', this.state.meta.name, this.getThreadMeta(thread).name)
		}
		return (
			<div>
				<div class="row">
					<div class="columns six">
						<h2>{this.state.meta.name}</h2>
					</div>
					<div class="columns three">
						<input class="u-full-width delete-button" type="button" value="Delete Room" />
					</div>
					<div class="columns three">
						{this.state.updateEnabled
							? <input class="u-full-width button-primary" type="button" value="Update Room" onClick={ev => updateThreadMeta(this.state.meta)} />
							: <input class="u-full-width button" disabled="disabled" type="button" value="Update Room" />
						}
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
