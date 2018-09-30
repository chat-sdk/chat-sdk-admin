import { Link } from 'preact-router/match'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import style from './style'

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
	fields = {...fields}
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
	fields = { ...fields }
	const { key, value } = createFieldData(fields)
	fields[key] = value
	if (typeof onUpdate === 'function')
		onUpdate(fields)
}

const removeField = (fields, onUpdate) => ev => {
	fields = { ...fields }
	delete fields[ev.target.dataset.fieldRow]
	if (typeof onUpdate === 'function')
		onUpdate(fields)
}

const renderFields = (fields, ignoreFields, onUpdate) => {
	fields = {...fields}
	const keys = Object.keys(fields)
	return keys.filter(key => !(ignoreFields || []).includes(key)).map(key => {
		return (
			<div class="row">
				<div class="columns five">
					<input class="u-full-width" type="text" data-field-type='key' data-field-row={key} value={key} onChange={handleInput(fields, ignoreFields, onUpdate)} />
				</div>
				<div class="columns six">
					<input class="u-full-width" type="text" data-field-type='value' data-field-row={key} value={fields[key]} onChange={handleInput(fields, ignoreFields, onUpdate)} />
				</div>
				<div class="column one">
					<Link class={'button u-full-width ' + style.delete_button} data-field-row={key} onClick={removeField(fields, onUpdate)}>
						<FontAwesomeIcon icon={faTimes} />
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
