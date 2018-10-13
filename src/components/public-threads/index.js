import { Link } from 'preact-router/match'
import { DotScale } from 'styled-loaders'

import style from './style'

const filterState = {
	thread: null,
}

const handleFilterInput = filterThreads => ev => {
	filterState[ev.target.dataset.filter] = ev.target.value
	filterThreads(filterState.thread)
}

const renderThreadsList = (threads, selectThread, loading) => {
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
	} else if (loading) {
		return <div>Loading...</div>
	} else {
		return <li class={style.no_threads_found}>No public rooms found</li>
	}
}

const renderRefreshButton = (refresh, loading) => {
	if (loading) {
		return <div class={style.loader + ' u-full-width button button-primary'}><DotScale color="white" /></div>
	} else {
		return <input class="u-full-width button-primary" type="button" value="Refresh" onClick={refresh} />
	}
}

const PublicThreads = ({ threads, filterThreads, selectThread, refresh, loading }) => (
	<div>
		<div class="row">
			<div class="columns three">
				<input class="u-full-width button-primary" type="button" value="Create Room" />
			</div>
			<div class="columns six">
				<input class="u-full-width" placeholder="Room Name" type="text" data-filter="thread" onInput={handleFilterInput(filterThreads)}/>
			</div>
			<div class="columns three">
				{renderRefreshButton(refresh, loading)}
			</div>
		</div>
		<ul class={style.threads_list}>
			{renderThreadsList(threads, selectThread, loading)}
		</ul>
	</div>
)

export default PublicThreads
