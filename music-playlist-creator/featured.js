async function loadFeaturedPlaylist() {
  try {
    const response = await fetch('data/data.json');
    if (!response.ok) {
      throw new Error('Failed to load playlist data');
    }

    const playlists = await response.json();
    if (!Array.isArray(playlists) || playlists.length === 0) {
      renderFeaturedError('No playlists found.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * playlists.length);
    const featuredPlaylist = playlists[randomIndex];
    renderFeaturedPlaylist(featuredPlaylist);
  } catch (error) {
    console.error('Error loading featured playlist:', error);
    renderFeaturedError('Unable to load featured playlist.');
  }
}

function renderFeaturedPlaylist(playlist) {
  const coverImage = document.querySelector('.featured-cover-image');
  const playlistName = document.querySelector('.featured-playlist-name');
  const playlistDate = document.querySelector('.featured-playlist-date');
  const songList = document.querySelector('.featured-song-list');

  if (!coverImage || !playlistName || !playlistDate || !songList) return;

  coverImage.src = playlist.coverImage;
  coverImage.alt = `${playlist.name} cover image`;
  coverImage.onerror = () => {
    coverImage.src = 'https://placehold.co/420x420?text=No+Image';
  };

  playlistName.textContent = playlist.name;
  playlistDate.textContent = `Date Added: ${playlist.dateAdded || 'Unknown'}`;
  songList.innerHTML = '';

  const songs = Array.isArray(playlist.songs) ? playlist.songs : [];

  songs.forEach((song) => {
    const row = document.createElement('article');
    row.className = 'featured-song-row';

    const songTitle = document.createElement('p');
    songTitle.className = 'featured-song-title';
    songTitle.textContent = song.title || 'Unknown Song';

    const songArtist = document.createElement('p');
    songArtist.className = 'featured-song-artist';
    songArtist.textContent = song.artist || 'Unknown Artist';

    const songDuration = document.createElement('p');
    songDuration.className = 'featured-song-duration';
    songDuration.textContent = song.duration || '0:00';

    row.appendChild(songTitle);
    row.appendChild(songArtist);
    row.appendChild(songDuration);
    songList.appendChild(row);
  });
}

function renderFeaturedError(message) {
  const playlistName = document.querySelector('.featured-playlist-name');
  const playlistDate = document.querySelector('.featured-playlist-date');
  const songList = document.querySelector('.featured-song-list');
  if (playlistName) playlistName.textContent = message;
  if (playlistDate) playlistDate.textContent = 'Date Added: --';
  if (songList) songList.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', loadFeaturedPlaylist);
