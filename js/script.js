document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('nav ul li');
  const feedContainer = document.querySelector('.feed-container');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show loader while fetching content
      feedContainer.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
      
      // If Foreign Media tab is clicked
      if (this.classList.contains('foreign-media')) {
        loadForeignMediaFeeds();
      } else {
        // Load other feeds based on the selected tab
        // Your existing code for other tabs
      }
    });
  });
  // LINKS TO RSS MEDIA
  function loadForeignMediaFeeds() {
    const rssFeeds = [
      { source: 'CNN', url: 'https://moxie.cnn.com/google-publisher/latest.xml', logo: 'images/cnn.png' },
      { source: 'Fox News', url: 'https://moxie.foxnews.com/google-publisher/latest.xml', logo: 'images/fox.png' },
      { source: 'Politico', url: 'https://rss.politico.com/politics-news.xml', logo: 'images/politico.jpg' }
    ];
    
    // Use a RSS to JSON API service to fetch the feeds
    // Example using rss2json.com API
    Promise.all(rssFeeds.map(feed => 
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
        .then(response => response.json())
        .then(data => ({ ...data, sourceName: feed.source, logo: feed.logo }))
    ))
    .then(results => {
      displayForeignMediaFeeds(results);
    })
    .catch(error => {
      console.error('Error fetching RSS feeds:', error);
      feedContainer.innerHTML = '<div class="error">Failed to load foreign media feeds</div>';
    });
  }
  
  function displayForeignMediaFeeds(feedsData) {
    feedContainer.innerHTML = '';
    
    feedsData.forEach(feed => {
      if (feed.items && feed.items.length > 0) {
        feed.items.slice(0, 5).forEach(item => {
          const feedItem = document.createElement('div');
          feedItem.className = 'feed-item';
          
          const imageUrl = item.thumbnail || item.enclosure?.link || 'path/to/default-image.jpg';
          
          feedItem.innerHTML = `
            <img src="${imageUrl}" alt="${item.title}" class="feed-item-image">
            <div class="feed-item-content">
              <div class="feed-item-source">
                <img src="${feed.logo}" alt="${feed.sourceName}" class="source-logo-small">
                ${feed.sourceName}
              </div>
              <h3 class="feed-item-title">${item.title}</h3>
              <div class="feed-item-date"><i class="far fa-clock"></i> ${new Date(item.pubDate).toLocaleDateString()}</div>
              <p class="feed-item-description">${item.description.substring(0, 150)}...</p>
              <a href="${item.link}" target="_blank" class="feed-item-link">Read More</a>
            </div>
          `;
          
          feedContainer.appendChild(feedItem);
        });
      }
    });
  }
});



document.addEventListener('DOMContentLoaded', function() {
  // Theme toggling
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  // Check for saved theme preference
  if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-theme');
  }

  // Navigation tabs
  const navItems = document.querySelectorAll('nav ul li');
  navItems.forEach(item => {
      item.addEventListener('click', function() {
          navItems.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
          fetchFeed(this.getAttribute('data-source'));
      });
  });

  // RSS Feed URLs
  const feedUrls = {
      polsat: 'https://www.polsatnews.pl/rss/wszystkie.xml',
      pap: 'https://pap-mediaroom.pl/rss.xml',
      tvn24: 'https://tvn24.pl/najnowsze.xml',
      rzeczpospolita: 'https://www.rp.pl/rss_main',
      notesfrompoland: 'https://notesfrompoland.com/feed',
      fakt: 'https://www.fakt.pl/rss',
      tvp: 'https://media2.pl/rss/tag/tvp-info.xml'
  };

  // Function to fetch and display feeds using a proxy
  function fetchFeed(source) {
      const feedContainer = document.querySelector('.feed-container');
      const loader = document.querySelector('.loader');
      
      feedContainer.innerHTML = '';
      loader.style.display = 'flex';
      
      // Using a CORS proxy to fetch the RSS feed
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const feedUrl = encodeURIComponent(feedUrls[source]);
      
      fetch(proxyUrl + feedUrl)
          .then(response => response.text())
          .then(data => {
              const parser = new DOMParser();
              const xml = parser.parseFromString(data, 'application/xml');
              const items = xml.querySelectorAll('item');
              
              loader.style.display = 'none';
              
              items.forEach(item => {
                  const title = item.querySelector('title')?.textContent || 'No Title';
                  const link = item.querySelector('link')?.textContent || '#';
                  const description = item.querySelector('description')?.textContent || 'No Description';
                  const pubDate = item.querySelector('pubDate')?.textContent || 'Unknown Date';
                  
                  // Extract image from description if available
                  let imageUrl = '';
                  if (description.includes('<img')) {
                      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                      if (imgMatch && imgMatch[1]) {
                          imageUrl = imgMatch[1];
                      }
                  }
                  
                  // Create feed item element
                  const feedItem = document.createElement('div');
                  feedItem.className = 'feed-item';
                  
                  feedItem.innerHTML = `
                      ${imageUrl ? `<img src="${imageUrl}" class="feed-item-image" alt="${title}">` : ''}
                      <div class="feed-item-content">
                          <h3 class="feed-item-title">${title}</h3>
                          <div class="feed-item-date"><i class="far fa-clock"></i> ${formatDate(pubDate)}</div>
                          <p class="feed-item-description">${stripHtml(description).substring(0, 150)}...</p>
                          <a href="${link}" target="_blank" class="feed-item-link">Read More</a>
                      </div>
                  `;
                  
                  feedContainer.appendChild(feedItem);
              });
              
              if (feedContainer.children.length === 0) {
                  feedContainer.innerHTML = '<p>No feed items found.</p>';
              }
          })
          .catch(error => {
              loader.style.display = 'none';
              feedContainer.innerHTML = `<p>Error loading feed: ${error.message}</p>`;
              console.error('Error fetching feed:', error);
          });
  }
  
  // Helper function to format date
  function formatDate(dateString) {
      try {
          const date = new Date(dateString);
          return date.toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          });
      } catch (e) {
          return dateString;
      }
  }
  
  // Helper function to strip HTML tags
  function stripHtml(html) {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
  }
  
  // Fetch default feed (Polsat News)
  fetchFeed('polsat');
});
