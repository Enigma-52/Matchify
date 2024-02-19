async function fetchSongs() {
    try {
      const response = await fetch('/songs');
      const songs = await response.json();
      renderSongs(songs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  
  function renderSongs(songs) {
    const songsList = document.getElementById('songs-list');
    songsList.innerHTML = ''; // Clear previous content
    songs.forEach(song => {
      const listItem = document.createElement('li');
      listItem.textContent = song.songName;
      songsList.appendChild(listItem);
    });
  }
  
  // Call fetchSongs function when the DOM is loaded
  document.addEventListener('DOMContentLoaded', fetchSongs);
  