import { Link } from 'preact-router/match'
import Times from 'preact-icons/io/close'

import style from './style'
import { clone } from '../../lib/utils'

const renameKey = (obj, oldKey, newKey) => {
	const keys = Object.keys(obj)
	return keys.reduce((acc, val) => {
		if (oldKey === val) acc[newKey] = obj[oldKey]
		else acc[val] = obj[val]
		return acc
	}, {})
}

const createFieldData = fields => {
	const keys = Object.keys(fields)
	let index = 1
	while (keys.includes('custom-field-' + index)) {
		index++
	}
	return {
		key: 'custom-field-' + index,
		value: 'Custom Field Value ' + index
	}
}

const handleInput = (fields, ignoreFields, onUpdate) => ev => {
	fields = clone(fields)
	const row = ev.target.dataset.fieldRow
	let value = ev.target.value
	if (ev.target.dataset.fieldType === 'key') {
		if ((ignoreFields || []).includes(value)) {
			value = 'custom-' + value
		}
		if (value.length === 0) {
			value = createFieldData(fields).key
		}
		fields = renameKey(fields, row, value)
	} else {
		fields[row] = value
	}
	if (typeof onUpdate === 'function')
		onUpdate(fields)
}

const addField = (fields, onUpdate) => ev => {
	fields = clone(fields)
	const { key, value } = createFieldData(fields)
	fields[key] = value
	if (typeof onUpdate === 'function')
		onUpdate(fields)
}

const removeField = (fields, onUpdate) => ev => {
	fields = clone(fields)
	delete fields[ev.target.dataset.fieldRow]
	if (typeof onUpdate === 'function')
		onUpdate(fields)
}

const renderDatalist = id => {
	return (
		<datalist id={id}>
			<option value="Red" />
			<option value="Green" />
			<option value="Blue" />
			<option value="Yellow" />
		</datalist>
	)
}

const renderFields = (fields, ignoreFields, onUpdate) => {
	return Object.keys(fields).filter(key => !(ignoreFields || []).includes(key)).map(key => {
		return (
			<div class="row">
				<div class="columns five">
					<input class="u-full-width" list={key + '-list'} type="text" data-field-type='key' data-field-row={key} value={key}
						onInput={handleInput(fields, ignoreFields, onUpdate)} />
					{renderDatalist(key + '-list')}
				</div>
				<div class="columns six">
					<input class="u-full-width" type="text" data-field-type='value' data-field-row={key} value={fields[key]}
						onInput={handleInput(fields, ignoreFields, onUpdate)} />
				</div>
				<div class="column one">
					<Link class={'button u-full-width ' + style.delete_button} data-field-row={key} onClick={removeField(fields, onUpdate)}>
						<Times />
					</Link>
				</div>
			</div>
		)
	})
}

const CustomFields = ({ fields, ignoreFields, onUpdate }) => {
	return (
		<div>
			<div class="row">
				<div class="columns nine">
					<h4>Custom Fields</h4>
				</div>
				<div class="columns three">
					<input class="u-full-width button-primary" type="button" value="Add Field" onClick={addField(fields, onUpdate)} />
				</div>
			</div>
			{renderFields(fields, ignoreFields, onUpdate)}
		</div>
	)
}

export default CustomFields
