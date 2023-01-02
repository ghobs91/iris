import Helmet from 'react-helmet';
import { html } from 'htm/preact';
import iris from 'iris-lib';

import FeedMessageForm from '../components/FeedMessageForm';
import MessageFeed from '../components/MessageFeed';
import OnboardingNotification from '../components/OnboardingNotification';
import SubscribeHashtagButton from '../components/SubscribeHashtagButton';

import View from './View';

class Feed extends View {
  constructor() {
    super();
    this.eventListeners = {};
    this.state = { sortedMessages: [], group: 'follows' };
    this.messages = {};
    this.id = 'message-view';
    this.class = 'public-messages-view';
  }

  search() {
    const searchTerm = this.props.term && this.props.term.toLowerCase();
    this.setState({ searchTerm });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.term !== this.props.term) {
      this.search();
    }
  }

  componentDidMount() {
    this.search();
    if (this.props.hashtag) {
      iris.local().get('filters').get('group').put('everyone');
    }
    iris.local().get('filters').get('group').on(this.inject());
  }

  filter(msg) {
    if (this.state.searchTerm) {
      return msg.text && msg.text.toLowerCase().indexOf(this.state.searchTerm) > -1;
    }
    return true;
  }

  renderView() {
    const s = this.state;
    let path = this.props.index || 'msgs';
    const hashtag = this.props.hashtag;
    const hashtagText = `#${hashtag}`;
    if (hashtag) {
      path = `hashtags/${hashtag}`;
    }
    return html`
      <div class="centered-container">
        <div style="display:flex;flex-direction:row">
          <div style="flex:3;width: 100%">
            ${hashtag
              ? html`
                  <${Helmet}>
                    <title>${hashtagText}</title>
                    <meta property="og:title" content="${hashtagText} | Iris" />
                  <//>
                  <h3>
                    ${hashtagText}
                    <span style="float:right"
                      ><${SubscribeHashtagButton} key=${hashtag} id=${hashtag}
                    /></span>
                  </h3>
                `
              : ''}
            ${s.searchTerm
              ? ''
              : html`
                  <${FeedMessageForm} key="form${path}" class="hidden-xs" autofocus=${false} />
                `}
            ${s.searchTerm
              ? html`<h2>Search results for "${s.searchTerm}"</h2>`
              : ((this.props.index !== 'everyone') ? html` <${OnboardingNotification} /> ` : '')}
            <${MessageFeed}
              scrollElement=${this.scrollElement.current}
              hashtag=${hashtag}
              filter=${s.searchTerm && ((m) => this.filter(m))}
              thumbnails=${this.props.thumbnails}
              key=${hashtag || this.props.index || 'feed'}
              index=${this.props.index}
              path=${path}
            />
          </div>
        </div>
      </div>
    `;
  }
}

export default Feed;
