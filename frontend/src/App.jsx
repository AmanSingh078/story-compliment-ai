import React, { useState } from 'react';
import './App.css';

function App() {
  const [story, setStory] = useState('');
  const [compliment, setCompliment] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showComplimentPopup, setShowComplimentPopup] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Please upload an image or video file');
        return;
      }
      
      setMedia(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.querySelector('.submit-button').blur(); // Remove focus after tap
    setLoading(true);
    setError('');
    setCompliment('');
    setAnalysis(null);
    setShowComplimentPopup(false);

    try {
      // For this simplified version, we'll generate a compliment directly in the frontend
      // without calling the backend API
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a sample compliment in Hindlish
      const sampleCompliments = [
        "Tumhara story dekh ke mujhe khushi mili! Tumhari positivity contagious hai yaar 😊",
        "Wow, tumne kya ache se enjoy kiya apna moment! Tumhara enthusiasm visible hai 💫",
        "Tumhare expressions mein jo energy hai na, woh inspire kar rahi hai! Keep shining 🌟",
        "Tumhara story mere dil ko chhoo gaya! Tum itne genuine ho 💌",
        "Tumhare har ek expression mein ek alag charm hai! Tum amazing ho ✨"
      ];
      
      const randomCompliment = sampleCompliments[Math.floor(Math.random() * sampleCompliments.length)];
      
      setCompliment(randomCompliment);
      setAnalysis({
        description: "User sharing a personal achievement or happy moment",
        emotion: "Joy",
        genderLikelihood: "Neutral",
        languagePreference: "hindlish"
      });
      setShowComplimentPopup(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeComplimentPopup = () => {
    setShowComplimentPopup(false);
  };

  const complimentModes = [
    { id: 'auto', name: 'Auto Select', emoji: '🤖' }
  ];

  // Handle touch events for better mobile experience
  const handleTouchStart = (e) => {
    e.target.classList.add('touch-active');
  };

  const handleTouchEnd = (e) => {
    e.target.classList.remove('touch-active');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="instagram-header">
          <div className="instagram-logo">
            <span className="instagram-icon">📸</span>
            <h1>StoryCompliment</h1>
          </div>
          <p className="tagline">Share your moment, get personalized love</p>
        </div>
      </header>

      <main className="App-main">
        <div className="story-creation-container">
          <div className="story-header">
            <div className="user-info">
              <div className="user-avatar">
                <div className="avatar-placeholder">👤</div>
              </div>
              <div className="user-name">Your Story</div>
            </div>
            <div className="story-controls">
              <button 
                className="camera-button"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                📷
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="story-form">
            <div className="media-upload-container">
              <label htmlFor="media">Upload Photo/Video:</label>
              <input
                type="file"
                id="media"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="media-input"
              />
              {mediaPreview && (
                <div className="media-preview">
                  {media && media.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="preview-video-placeholder">
                      <p>🎥</p>
                      <p>Video Preview</p>
                      <p>{media ? media.name : ''}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !media} 
              className="submit-button"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Analyzing...</span>
                </div>
              ) : (
                'Share Story'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Compliment Popup Modal */}
        {showComplimentPopup && (
          <div className="popup-overlay" onClick={closeComplimentPopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h2>From Your Secret Admirer 💖</h2>
                <button 
                  className="close-popup" 
                  onClick={closeComplimentPopup}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  ×
                </button>
              </div>
              <div className="popup-body">
                <div className="compliment-message">
                  <p>{compliment}</p>
                </div>
                <div className="compliment-actions">
                  <button 
                    className="action-button like-button"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    👍 Like
                  </button>
                  <button 
                    className="action-button share-button"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    ↗️ Share
                  </button>
                  <button 
                    className="action-button close-button"
                    onClick={closeComplimentPopup}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built by aurameter</p>
      </footer>
    </div>
  );
}

export default App;