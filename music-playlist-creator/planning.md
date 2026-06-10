## Music Playlist Explorer — Planning Spec

### Data Shape
playlist:
  - id (number) — unique identifier for each playlist
  - name (string) — the title of the playlist
  - author (string) — the creator of the playlist
  - coverImage (string) — URL path to the playlist cover image
  - likeCount (number) — number of likes the playlist has
  - dateAdded (string) — date the playlist was added (YYYY-MM-DD)
  - songs (array) — list of song objects in the playlist

song:
  - title (string) — the name of the song
  - artist (string) — the performing artist
  - duration (string) — length of the song (e.g. "3:45")

### UI and Interaction Rules
The web app lets users browse a curated collection of music playlists. Users can explore playlist details in a modal, like their favorite playlists, shuffle songs, and get a dedicated Featured page that showcases a randomly selected playlist.
There is a nav bar that lets users switch between "All Playlists" and a "Featured" pages without browser navigation.
The main sections of the hompeage are the displayed playlists and the featured page that shows the playlist image, playlist name, and list of songs. When the user clicks a playlist card (coverimage, playlist name, author, and likecount), the modal appears with songs under that playlist will appear along with the cover image, playlist name, artist and duration. 
When the user clicks the like icon, the like count should increase, if unliked the like count shoul decrease and change colors accordingly. 
Clicking outside the modal (the background) closes it.


### Function Specs

#### renderPlaylistCards()
- Purpose: Dynamically create and display playlist cards on the homepage
- Input: None (reads from global playlists data array)
- Output: None (modifies DOM directly)
- DOM Target: Appends to `.playlist-cards` container
- Data Fields Used:
  - playlist.coverImage — displayed as card image
  - playlist.name — displayed as playlist title
  - playlist.author — displayed as creator name
  - playlist.likeCount — displayed as like count
- Behavior:
  - If playlists array is empty, displays "No playlists found" message
  - For each playlist, creates an article.playlist-card element with proper structure
  - Clears any existing placeholder cards before rendering

#### createPlaylistCards()
- Purpose: Dynamically create and display playlist cards on the homepage
- Input: None (reads from global playlists data array)
- Output: None (modifies DOM directly)
- DOM Target: Appends to `.playlist-cards` container
- Data Fields Used:
  - playlist.coverImage — displayed as card image
  - playlist.name — displayed as playlist title
  - playlist.author — displayed as creator name
  - playlist.likeCount — displayed as like count
- Behavior:
  - If playlists array is empty, displays "No playlists found" message
  - For each playlist, creates an article.playlist-card element with proper structure
  - Clears any existing placeholder cards before rendering

#### populateModal(playlist)
- Purpose: Populates the modal with detailed information about 
  a clicked playlist and makes it visible
- Inputs: playlist (object) — a single playlist object from 
  data.json with fields: id, name, author, coverImage, 
  likeCount, songs[]
- DOM Elements Updated:
  - .modal-cover-image — updated to playlist's cover image
  - .modal-playlist-name — updated to playlist's name
  - .modal-playlist-author — updated to playlist's author
  - .modal-song-list — cleared and repopulated with song rows
- Output: none (void)
- Side Effects: 
  - modal overlay becomes visible (hidden class removed)
  - background page is no longer scrollable
- When finished the modal should show:
  - Playlist cover image and title at the top
  - Author name below the title
  - A list of songs each showing title, artist, and duration

#### closeModal()
- Purpose: Hides the modal and resets its content
- Inputs: none
- DOM Elements Updated:
  - .modal-overlay — hidden class added back
- Side Effects:
  - Page scrolling restored

#### togglePlaylistLike(playlistId)
- Unliked -> liked: increment likeCount, mark isLiked=true, update icon/class.
- Liked -> unliked: decrement likeCount (never below 0), mark isLiked=false, update icon/class.
- Constraint: each playlist has exactly one boolean isLiked source of truth for this user session.

#### getPlaylistDescription
- Purpose: Calls the OpenRouter API using the google/gemma-4-26b-a4b-it:free model to generate a 2-3 sentence description based on the playlist's name, author, and songs. It should display the generated description in the modal.
- Inputs: playlist = containts name, author, and songs array
- Output: Diplays the 2-3 sentence text description in the 'ai-description' element inside the modal. 

### Featured Page
- Purpose: Show one randomly selected playlist on a dedicated Featured page.
- Data shown:
  - Playlist image
  - Playlist name
  - Song list with title, artist, and duration
- Behavior:
  - Fetch playlist data from `data/data.json` on page load
  - Select one playlist using `Math.random()`
  - Render the selected playlist into the Featured page layout
  - Reloading the page can show a different playlist (or the same one by chance)
- Navigation:
  - Users can move between All Playlists and Featured pages with nav links, without using browser back/forward buttons


### AI Feature Spec (Milestone 8)

Role: The role of the model is to get a written description of the playlist.
Task: The model will generate  a description for the music playlist based on its name, author, and song list.
Inputs: The data.json file wll be passed to the model to generate a description.
Output format: The response will be a 2–3 sentence description that captures the vibe and theme of the playlist.
Constraints: The model will not list the songs individually and should not use generic marketing language.
Failure behavior: If the API fails it will output a failure message asking to try again in a few moments. 

### Decisions Log
Milestone 1 - Chose a semantic app layout with header, main playlist area, and footer to keep structure clear and accessible.

Milestone 2 - Built reusable card and modal styles first (including responsive playlist grid and modal overlay) so JavaScript could target stable class names.

Milestone 3 - Defined playlist/song data shape in planning.md and created matching data in `data/data.json`; implemented dynamic card rendering from data instead of hardcoded HTML.

Milestone 4 - Implemented `populateModal(playlist)` to render playlist details and songs in the modal; added open-on-card-click and close-on-overlay-click behavior.



