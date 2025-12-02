import { useState } from 'react'
import {
  Video, VideoOff, Mic, MicOff, Monitor, Settings,
  Users, MessageSquare, DollarSign, Music, Smartphone,
  Send, Heart, Gift
} from 'lucide-react'
import './Stream.css'

function Stream() {
  const [isLive, setIsLive] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  const chatMessages = [
    { user: 'MusicFan22', message: 'This track is fire!', type: 'message' },
    { user: 'NightOwl', message: 'Love your streams!', type: 'message' },
    { user: 'StreamLover', message: '$25', type: 'tip' },
    { user: 'VibeCheck', message: 'Can you play something chill?', type: 'message' },
    { user: 'PartyTime', message: 'Subscribed!', type: 'sub' },
    { user: 'DJ_Mike', message: 'Great transitions!', type: 'message' },
  ]

  const currentTrack = {
    title: 'Midnight Drive',
    artist: 'Synthwave Dreams',
    bpm: 128,
    elapsed: '2:34',
    total: '4:12'
  }

  return (
    <div className="stream-page">
      <div className="stream-main">
        <div className="stream-preview card">
          <div className="preview-video">
            {!isLive ? (
              <div className="preview-placeholder">
                <Video size={64} />
                <p>Your stream preview will appear here</p>
              </div>
            ) : (
              <div className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </div>
            )}
          </div>
          <div className="stream-controls">
            <div className="control-group">
              <button
                className={`control-btn ${!videoOn ? 'off' : ''}`}
                onClick={() => setVideoOn(!videoOn)}
              >
                {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button
                className={`control-btn ${!micOn ? 'off' : ''}`}
                onClick={() => setMicOn(!micOn)}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button className="control-btn">
                <Monitor size={20} />
              </button>
              <button className="control-btn">
                <Settings size={20} />
              </button>
            </div>
            <button
              className={`go-live-btn ${isLive ? 'live' : ''}`}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'End Stream' : 'Go Live'}
            </button>
          </div>
        </div>

        <div className="stream-info-panel card">
          <h3>Stream Settings</h3>
          <div className="info-field">
            <label>Stream Title</label>
            <input type="text" defaultValue="Friday Night Mix Session" />
          </div>
          <div className="info-field">
            <label>Category</label>
            <select defaultValue="dj">
              <option value="dj">DJ / Music</option>
              <option value="gaming">Gaming</option>
              <option value="chat">Just Chatting</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div className="info-field">
            <label>Tags</label>
            <div className="tags">
              <span className="tag">Electronic</span>
              <span className="tag">House</span>
              <span className="tag">Live DJ</span>
              <span className="tag add">+ Add</span>
            </div>
          </div>
        </div>

        <div className="integrations-panel card">
          <h3>Active Integrations</h3>
          <div className="integration-status">
            <div className="integration-item connected">
              <Music size={20} />
              <div className="integration-info">
                <span className="integration-name">Serato DJ</span>
                <span className="integration-state">Connected</span>
              </div>
            </div>
            <div className="integration-item connected">
              <Smartphone size={20} />
              <div className="integration-info">
                <span className="integration-name">Lovense</span>
                <span className="integration-state">2 devices</span>
              </div>
            </div>
          </div>

          <div className="now-playing">
            <h4>Now Playing (Serato)</h4>
            <div className="track-info">
              <div className="track-art"></div>
              <div className="track-details">
                <span className="track-title">{currentTrack.title}</span>
                <span className="track-artist">{currentTrack.artist}</span>
                <div className="track-progress">
                  <span>{currentTrack.elapsed}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '60%' }}></div>
                  </div>
                  <span>{currentTrack.total}</span>
                </div>
              </div>
              <span className="track-bpm">{currentTrack.bpm} BPM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stream-sidebar">
        <div className="chat-panel card">
          <div className="chat-header">
            <h3>
              <MessageSquare size={18} />
              Live Chat
            </h3>
            <div className="viewer-count">
              <Users size={16} />
              <span>{isLive ? '1,247' : '0'}</span>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                {msg.type === 'tip' && <Gift size={14} />}
                {msg.type === 'sub' && <Heart size={14} />}
                <span className="chat-user">{msg.user}:</span>
                <span className="chat-text">
                  {msg.type === 'tip' ? `Tipped ${msg.message}` :
                   msg.type === 'sub' ? msg.message : msg.message}
                </span>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input type="text" placeholder="Send a message..." />
            <button className="send-btn">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="earnings-panel card">
          <h3>
            <DollarSign size={18} />
            Today's Earnings
          </h3>
          <div className="earnings-amount">$342.50</div>
          <div className="earnings-breakdown">
            <div className="earning-item">
              <span>Tips</span>
              <span>$186.00</span>
            </div>
            <div className="earning-item">
              <span>Subscriptions</span>
              <span>$125.00</span>
            </div>
            <div className="earning-item">
              <span>Pay-per-view</span>
              <span>$31.50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stream
