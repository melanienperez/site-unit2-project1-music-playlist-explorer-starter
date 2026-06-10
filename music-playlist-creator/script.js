// Global playlists data (loaded from data/data.json)
let playlists = [];
let currentModalPlaylist = null;
let currentSortOption = 'original';

async function loadPlaylists() {
  try {
    const response = await fetch('data/data.json');
    if (!response.ok) {
      throw new Error('Failed to load playlist data');
    }
    playlists = await response.json();
  } catch (error) {
    console.error('Error loading playlists:', error);
    playlists = [];
  }
}

// Render playlists from loaded JSON data
function renderPlaylists() {
  // Get the container
  const container = document.querySelector('.playlist-cards');
  if (!container) return;
  container.innerHTML = '';

  // Check if playlists array is empty
  if (playlists.length === 0) {
    console.warn('No playlistsData found. Check that data/data.js loads before script.js.');
    container.innerHTML = '<p style="text-align: center; padding: 2rem; font-size: 1.2rem;">No playlists found</p>';
    return;
  }

  const playlistsToDisplay = getSortedPlaylists(playlists, currentSortOption);

  // Iterate over playlists and create cards
  playlistsToDisplay.forEach((playlist) => {
      if (typeof playlist.isLiked !== 'boolean') {
        playlist.isLiked = false;
      }

      // Create the article element
      const article = document.createElement('article');
      article.className = 'playlist-card';

      // Create and set the cover image
      const img = document.createElement('img');
      img.className = 'playlist-cover-image';
      img.src = playlist.coverImage;
      img.alt = `${playlist.name} cover image`;
      img.onerror = () => {
        img.src = 'https://placehold.co/300x300?text=No+Image';
      };

      // Create the content container
      const contentDiv = document.createElement('div');
      contentDiv.className = 'playlist-card-content';

      // Create the playlist name
      const title = document.createElement('h2');
      title.className = 'playlist-title';
      title.textContent = playlist.name;

      // Create the author
      const author = document.createElement('p');
      author.className = 'playlist-author';
      author.textContent = playlist.author;

      // Create the like count container
      const likeCount = document.createElement('p');
      likeCount.className = 'playlist-like-count';
      likeCount.setAttribute('aria-label', 'likes');

      // Create the heart icon
      const likeIcon = document.createElement('i');
      likeIcon.className = `playlist-like-icon fa-heart ${playlist.isLiked ? 'fa-solid is-liked' : 'fa-regular'}`;
      likeIcon.setAttribute('aria-hidden', 'true');

      // Create the like count number
      const likeNumber = document.createElement('span');
      likeNumber.textContent = playlist.likeCount;

      // Assemble the like count
      likeCount.appendChild(likeIcon);
      likeCount.appendChild(likeNumber);

      // Assemble the content div
      contentDiv.appendChild(title);
      contentDiv.appendChild(author);
      contentDiv.appendChild(likeCount);

      // Assemble the card
      article.appendChild(img);
      article.appendChild(contentDiv);

      // Store playlist id so click delegation can map card -> playlist data.
      article.dataset.playlistId = String(playlist.id);

      // Append to container
    container.appendChild(article);
  });
}

function getSortedPlaylists(playlistList, sortOption) {
  const copy = [...playlistList];

  switch (sortOption) {
    case 'name-az':
      copy.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'likes-desc':
      copy.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case 'date-desc':
      copy.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
    case 'language-spanish-first': {
      const languagePriority = {
        Spanish: 0,
        English: 1
      };

      copy.sort((a, b) => {
        const aPriority = languagePriority[a.language] ?? 2;
        const bPriority = languagePriority[b.language] ?? 2;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        return a.name.localeCompare(b.name);
      });
      break;
    }
    default:
      break;
  }

  return copy;
}

function getPlaylistById(playlistId) {
  return playlists.find((playlist) => playlist.id === playlistId);
}

function getDisplaySongs(playlist, songsOverride = null) {
  const songs = Array.isArray(songsOverride)
    ? songsOverride.slice(0, 3)
    : (Array.isArray(playlist.songs) ? playlist.songs.slice(0, 3) : []);

  while (songs.length < 3) {
    songs.push({
      title: 'Unknown Song',
      artist: 'Unknown Artist',
      image: playlist.coverImage,
      duration: '0:00'
    });
  }

  return songs;
}

function renderModalSongs(playlist, songsOverride = null) {
  const songSection = document.querySelector('.modal-song-section');
  if (!songSection) return;

  songSection.innerHTML = '';
  const songs = getDisplaySongs(playlist, songsOverride);

  songs.forEach((song) => {
    const songRow = document.createElement('article');
    songRow.className = 'modal-song-row';

    // Song cover image
    const songCover = document.createElement('img');
    songCover.className = 'modal-song-cover-image';
    songCover.src = song.image || playlist.coverImage;
    songCover.alt = `${song.title} thumbnail`;

    // Song meta container
    const songMeta = document.createElement('div');
    songMeta.className = 'modal-song-meta';

    // Song title
    const songTitle = document.createElement('p');
    songTitle.className = 'modal-song-title';
    songTitle.textContent = song.title;

    // Song artist
    const songArtist = document.createElement('p');
    songArtist.className = 'modal-song-artist';
    songArtist.textContent = song.artist;

    // Assemble song meta
    songMeta.appendChild(songTitle);
    songMeta.appendChild(songArtist);

    // Song duration
    const songDuration = document.createElement('p');
    songDuration.className = 'modal-song-duration';
    songDuration.textContent = song.duration;

    // Assemble song row
    songRow.appendChild(songCover);
    songRow.appendChild(songMeta);
    songRow.appendChild(songDuration);

    // Append to song section
    songSection.appendChild(songRow);
  });
}

function shuffleSongs(songs) {
  const shuffledSongs = [...songs];
  for (let i = shuffledSongs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
  }
  return shuffledSongs;
}

async function getPlaylistDescription(playlist) {
  const descriptionElement = document.querySelector('.ai-description');
  if (!descriptionElement || !playlist) return;

  const failureMessage = 'Unable to generate a description right now. Please try again in a few moments.';
  descriptionElement.textContent = 'Loading description...';

  try {
    const artists = Array.isArray(playlist.songs)
      ? playlist.songs.map((song) => song.artist).filter(Boolean)
      : [];

    const userMessage = `Playlist name: ${playlist.name}
Author: ${playlist.author}
Song artists: ${artists.join(', ')}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages: [
          {
            role: 'system',
            content: 'You are a music curator. Write a 2-3 sentence description that captures the vibe and theme of the playlist. Do not list songs individually or use generic marketing language. Keep it under 75 words.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!response.ok) {
      descriptionElement.textContent = failureMessage;
      return failureMessage;
    }

    const data = await response.json();
    const descriptionText = data.choices[0].message.content.trim();

    if (!descriptionText) {
      descriptionElement.textContent = failureMessage;
      return failureMessage;
    }

    descriptionElement.textContent = descriptionText;
    return descriptionText;
  } catch (error) {
    console.error('Error generating playlist description:', error);
    descriptionElement.textContent = failureMessage;
    return failureMessage;
  }
}

// Populate modal with playlist details
function populateModal(playlist) {
  const coverImage = document.querySelector('.modal-playlist-cover-image');
  const playlistTitle = document.querySelector('.modal-playlist-title');
  const playlistAuthor = document.querySelector('.modal-playlist-author');
  const playlistDate = document.querySelector('.modal-playlist-date');
  const modalOverlay = document.querySelector('.modal-overlay');

  if (!coverImage || !playlistTitle || !playlistAuthor || !playlistDate || !modalOverlay) return;

  currentModalPlaylist = playlist;

  // Update modal header with clicked playlist data
  coverImage.src = playlist.coverImage;
  coverImage.alt = `${playlist.name} cover image`;
  playlistTitle.textContent = playlist.name;
  playlistAuthor.textContent = playlist.author;
  playlistDate.textContent = `Date Added: ${playlist.dateAdded || 'Unknown'}`;
  const descriptionElement = document.querySelector('.ai-description');
  if (descriptionElement) {
    descriptionElement.textContent = '';
  }

  renderModalSongs(playlist);

  // Show modal after data is populated
  modalOverlay.classList.remove('is-hidden');
  modalOverlay.setAttribute('aria-hidden', 'false');
}

// Close modal
function closeModal() {
  const modalOverlay = document.querySelector('.modal-overlay');
  if (!modalOverlay) return;
  currentModalPlaylist = null;
  modalOverlay.classList.add('is-hidden');
  modalOverlay.setAttribute('aria-hidden', 'true');
}

// Close modal when clicking outside of it
function setupModalCloseListener() {
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalContent = document.querySelector('.modal-content');
  if (!modalOverlay || !modalContent) return;

  modalOverlay.addEventListener('click', (event) => {
    // Close when click happens outside the modal card.
    if (!modalContent.contains(event.target)) {
      closeModal();
    }
  });
}

function setupPlaylistCardOpenListener() {
  const container = document.querySelector('.playlist-cards');
  if (!container) return;

  container.addEventListener('click', (event) => {
    // Ignore clicks on the like control so only card-body clicks open modal.
    if (event.target.closest('.playlist-like-count')) return;

    const card = event.target.closest('.playlist-card');
    if (!card || !container.contains(card)) return;

    const playlistId = Number(card.dataset.playlistId);
    const playlist = getPlaylistById(playlistId);
    if (!playlist) return;

    populateModal(playlist);
  });
}

function setupLikeToggleListener() {
  const container = document.querySelector('.playlist-cards');
  if (!container) return;

  container.addEventListener('click', (event) => {
    const likeControl = event.target.closest('.playlist-like-count');
    if (!likeControl || !container.contains(likeControl)) return;

    const card = likeControl.closest('.playlist-card');
    if (!card) return;

    const playlistId = Number(card.dataset.playlistId);
    const playlist = getPlaylistById(playlistId);
    if (!playlist) return;

    playlist.isLiked = !playlist.isLiked;
    if (playlist.isLiked) {
      playlist.likeCount += 1;
    } else {
      playlist.likeCount = Math.max(0, playlist.likeCount - 1);
    }

    const likeIcon = likeControl.querySelector('.playlist-like-icon');
    const likeNumber = likeControl.querySelector('span:last-child');
    if (!likeIcon || !likeNumber) return;

    likeIcon.classList.toggle('fa-solid', playlist.isLiked);
    likeIcon.classList.toggle('fa-regular', !playlist.isLiked);
    likeIcon.classList.toggle('is-liked', playlist.isLiked);
    likeNumber.textContent = playlist.likeCount;
  });
}

function setupShuffleListener() {
  const shuffleButton = document.querySelector('.modal-shuffle-button');
  if (!shuffleButton) return;

  shuffleButton.addEventListener('click', () => {
    if (!currentModalPlaylist || !Array.isArray(currentModalPlaylist.songs)) return;
    const shuffledSongs = shuffleSongs(currentModalPlaylist.songs);
    renderModalSongs(currentModalPlaylist, shuffledSongs);
  });
}

function setupDescriptionListener() {
  const descriptionButton = document.querySelector('.modal-description-button');
  if (!descriptionButton) return;

  descriptionButton.addEventListener('click', () => {
    if (!currentModalPlaylist) return;
    getPlaylistDescription(currentModalPlaylist);
  });
}

function setupSortListener() {
  const sortSelect = document.querySelector('#playlist-sort');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (event) => {
    currentSortOption = event.target.value;
    renderPlaylists();
  });
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  closeModal(); // Ensure modal starts hidden until a playlist is selected.
  loadPlaylists().then(() => {
    renderPlaylists();
    setupLikeToggleListener();
    setupPlaylistCardOpenListener();
    setupModalCloseListener();
    setupShuffleListener();
    setupDescriptionListener();
    setupSortListener();
  });
});
