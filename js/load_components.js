//top bar
document.addEventListener("DOMContentLoaded", () => {
    const topbar = document.getElementById("topbar");
  
    if (topbar) {
      fetch("/2025-herethon-8/components/topbar.html")
        .then(res => res.text())
        .then(html => {
          topbar.innerHTML = html;
        });
    }
  });
  