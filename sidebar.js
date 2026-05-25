fetch('/sugbohenyo/sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('sidebar').innerHTML = data;

    const currentPath = window.location.pathname; // "/sugbohenyo/dashboard"

    document.querySelectorAll('#sidebar a').forEach(link => {
      const href = link.getAttribute('href'); // "/dashboard"

      if (currentPath.endsWith(href)) {  // ← change === to .endsWith()
        link.classList.add('active');
      }
    });
  });

document.addEventListener('click', async (e) => {
  if (e.target.closest('#logout-btn')) {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
});