(() => {
  function activateSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => section.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => link.classList.remove('active'));

    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initSectionLinks() {
    document.querySelectorAll('[data-section]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const sectionId = link.getAttribute('data-section');
        if (!sectionId) return;

        event.preventDefault();
        activateSection(sectionId);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSectionLinks();

    if (typeof window.navigateTo === 'function') {
      return;
    }

    window.navigateTo = activateSection;
    activateSection('home');
  });
})();
