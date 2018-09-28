import { route } from 'preact-router'
import { Link } from 'preact-router/match'

import style from './style'

const filterState = {
	user: null,
	message: null
}

const handleFilterInput = filterMessages => ev => {
	filterState[ev.target.dataset.filter] = ev.target.value
	filterMessages(filterState.user, filterState.message)
}

const renderMessages = (messages, users, unflagMessage, deleteMessage, refresh) => {
	const mids = Object.keys(messages || {})
	if (mids.length > 0) {
		return mids.map(mid => {
			const message = messages[mid]
			const avatar = users[message['sender-entity-id']].meta.pictureURL
			return (
				<li class={style.flagged_list_item}>
					{avatar ? <img class={style.user_avatar} src={avatar} /> : <div class={style.user_avatar} />}
					<span class="message">{message.message}</span>
					<span class={style.flagged_list_right}>
						<Link href="#" onClick={ev => unflagMessage(mid).then(refresh)}>unflag</Link>
						<Link href="#" onClick={ev => deleteMessage(mid).then(refresh)}>delete</Link>
					</span>
				</li>
			)
		})
	} else {
		return <li>No flagged messages found!</li>
	}
}

const Moderation = ({ messages, filterMessages, users, unflagMessage, deleteMessage, refresh }) => (
	<div class={style.moderation}>
		<div class="row">
			<div class="columns four">
				<input class="u-full-width" data-filter="user" type="text" placeholder="Any User" value={filterState.user} onInput={handleFilterInput(filterMessages)} />
			</div>
			<div class="columns five">
				<input class="u-full-width" data-filter="message" type="text" placeholder="Any Message" value={filterState.message} onInput={handleFilterInput(filterMessages)} />
			</div>
			<div class="columns three">
				<input class="u-full-width button-primary" type="button" value="Refresh" onClick={refresh} />
			</div>
		</div>
		<ul class={style.flagged_list}>
			{renderMessages(messages, users, unflagMessage, deleteMessage, refresh)}
		</ul>
	</div>
)

export default Moderation
