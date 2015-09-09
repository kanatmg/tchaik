"use strict";

import React from "react";

import Icon from "./Icon.js";

import NowPlayingActions from "../actions/NowPlayingActions.js";
import NowPlayingStore from "../stores/NowPlayingStore.js";
import NowPlaying from "./NowPlaying.js";

import PlayProgress from "./PlayProgress.js";
import Volume from "./Volume.js";

import CursorStore from "../stores/CursorStore.js";
import CursorActions from "../actions/CursorActions.js";

import PlayingStatusStore from "../stores/PlayingStatusStore.js";

import RightColumnStore from "../stores/RightColumnStore.js";
import RightColumnActions from "../actions/RightColumnActions.js";


var BACKWARD_TIMEOUT = 2000;

export default class Bottom extends React.Component {
  render() {
    return (
      <div className="bottom-container">
        <PlayProgress/>
        <div className="now-playing">
          <NowPlaying />
          <Controls />
          <div className="right">
            <Volume />
            <RightColumnToggle />
          </div>
        </div>
      </div>
    );
  }
}

class RightColumnToggle extends React.Component {
  constructor(props) {
    super(props);

    this._onClick = this._onClick.bind(this);
  }

  componentDidMount() {
    RightColumnStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    RightColumnStore.removeChangeListener(this._onChange);
  }

  render() {
    return (
      <div className="right-column-toggle">
        <Icon icon="queue_music"onClick={this._onClick} />
      </div>
    );
  }

  _onChange() {
  }

  _onClick() {
    RightColumnActions.toggle();
  }
}

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: NowPlayingStore.getPlaying(),
      repeat: NowPlayingStore.getRepeat(),
      track: NowPlayingStore.getTrack(),
      canNext: CursorStore.canNext(),
      canPrev: CursorStore.canPrev(),
    };

    this._onChangeCursor = this._onChangeCursor.bind(this);
    this._onChange = this._onChange.bind(this);
    this._togglePlayPause = this._togglePlayPause.bind(this);
    this._onBackward = this._onBackward.bind(this);
    this._onForward = this._onForward.bind(this);
    this._toggleRepeat = this._toggleRepeat.bind(this);
  }

  componentDidMount() {
    NowPlayingStore.addChangeListener(this._onChange);
    CursorStore.addChangeListener(this._onChangeCursor);
  }

  componentWillUnmount() {
    NowPlayingStore.removeChangeListener(this._onChange);
    CursorStore.removeChangeListener(this._onChangeCursor);
  }

  render() {
    var prevClasses = {"skip": true, "enabled": this.state.canPrev};
    var nextClasses = {"skip": true, "enabled": this.state.canNext};
    var repeatClasses = {"skip": true, "enabled": (this.state.track !== null)};
    var repeatName = (this.state.repeat) ? "repeat_one" : "repeat";
    return (
      <div className="controls">
        <Icon icon="skip_previous" extraClasses={prevClasses} onClick={this._onBackward} />
        <span><Icon icon={this.state.playing ? "pause_circle_filled" : "play_circle_filled"}extraClasses={{"play-pause": true, "enabled": (this.state.track !== null)}} onClick={this._togglePlayPause} /></span>
        <Icon icon="skip_next" extraClasses={nextClasses} onClick={this._onForward} />
        <Icon icon={repeatName} extraClasses={repeatClasses} onClick={this._toggleRepeat} />
      </div>
    );
  }

  _onChangeCursor() {
    this.setState({
      canNext: CursorStore.canNext(),
      canPrev: CursorStore.canPrev(),
    });
  }

  _onChange() {
    this.setState({
      playing: NowPlayingStore.getPlaying(),
      repeat: NowPlayingStore.getRepeat(),
      track: NowPlayingStore.getTrack(),
    });

    var favicon = document.querySelector("head link[rel=\"shortcut icon\"]");
    var currentTrack = NowPlayingStore.getTrack();
    if (currentTrack === null) {
      document.title = "tchaik";
      return;
    }
    document.title = currentTrack.name;
    var faviconUrl = `/icon/${currentTrack.id}`;
    if (!favicon.href.endsWith(faviconUrl)) {
      favicon.href = faviconUrl;
    }
  }

  _togglePlayPause() {
    NowPlayingActions.playing(!this.state.playing);
    this.setState({
      playing: !this.state.playing,
    });
  }

  _backButtonTimerRunning() {
    if (this._backButtonTimer) {
      return true;
    }
    return false;
  }

  _backButtonTimerStart() {
    if (this._backButtonTimer) {
      clearTimeout(this._backButtonTimer);
    }
    this._backButtonTimer = setTimeout(this._backButtonTimerTimeout, BACKWARD_TIMEOUT);
  }

  _backButtonTimerTimeout() {
    this._backButtonTimer = null;
  }

  _prev() {
    CursorActions.prev();
  }

  _onBackward() {
    if (this._backButtonTimerRunning()) {
      CursorActions.prev();
    } else if (this.state.playing || PlayingStatusStore.getTime() > 0) {
      NowPlayingActions.setCurrentTime(0);
    } else {
      CursorActions.prev();
    }
    this._backButtonTimerStart();
    return;
  }

  _onForward() {
    CursorActions.next();
  }

  _toggleRepeat() {
    NowPlayingActions.repeat(!this.state.repeat);
    this.setState({
      repeat: !this.state.repeat,
    });
  }

}
