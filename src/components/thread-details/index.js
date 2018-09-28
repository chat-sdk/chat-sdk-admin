import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const threadMeta = {}

const handleInputChange = ev => {
	threadMeta[ev.target.id] = ev.target.value
}

const ThreadDetails = ({ thread, updateThreadMeta }) => {
	if (!thread) return <div class={style.thread_details}></div>
	threadMeta.name = thread.meta && thread.meta.name || thread.details.name
	return (
		<div class={style.thread_details}>
			<div class="row">
				<div class="columns six">
					<h2>{threadMeta.name}</h2>
				</div>
				<div class="columns three">
					<input class="u-full-width" type="button" value="Delete Room" />
				</div>
				<div class="columns three">
					<input class="u-full-width button-primary" type="button" value="Update Room" onClick={ev => updateThreadMeta(threadMeta)} />
				</div>
			</div>
			<div class="row">
				<label for="name">Name</label>
				<input class="u-full-width" type="text" id="name" value={threadMeta.name} onChange={handleInputChange} />
			</div>
		</div>
	)
}

export default ThreadDetails
