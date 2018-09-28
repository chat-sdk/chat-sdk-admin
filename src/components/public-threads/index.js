import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const filterState = {
	thread: null,
}

const handleFilterInput = filterThreads => ev => {
	filterState[ev.target.dataset.filter] = ev.target.value
	filterThreads(filterState.thread)
}

const renderThreadsList = (threads, selectThread) => {
	const tids = Object.keys(threads || {})
	if (tids.length > 0) {
		return tids.map(tid => {
			const thread = threads[tid]
			return (
				<li class={style.threads_list_item}>
					{ (thread.meta && thread.meta.name) || thread.details.name }
					<span class={style.threads_list_right}>
						<Link href="#" onClick={ev => selectThread(tid)}>edit</Link>
						<Link href="#">delete</Link>
					</span>
				</li>
			)
		})
	} else {
		return <li>No rooms found!</li>
	}
}

const PublicThreads = ({ threads, filterThreads, selectThread, refresh }) => (
	<div class={style.public_threads}>
		<div class="row">
			<div class="columns three">
				<input class="u-full-width button-primary" type="button" value="Create Room" />
			</div>
			<div class="columns six">
				<input class="u-full-width" placeholder="Room Name" type="text" data-filter="thread" onInput={handleFilterInput(filterThreads)}/>
			</div>
			<div class="columns three">
				<input class="u-full-width button-primary" type="button" value="Refresh" onClick={refresh} />
			</div>
		</div>
		<ul class={style.threads_list}>
			{renderThreadsList(threads, selectThread)}
		</ul>
	</div>
)

export default PublicThreads
