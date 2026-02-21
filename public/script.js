// API base URL - spremenite glede na vaš backend
const API_BASE = 'http://localhost:3000/api';

// ============================================
// SPLOŠNE FUNKCIJE
// ============================================

// Funkcija za vključevanje HTML datotek
async function includeHTML() {
    const includeElements = document.querySelectorAll('[data-include]');
    
    for (const element of includeElements) {
        const file = element.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (response.ok) {
                const content = await response.text();
                element.innerHTML = content;
                
                // Po vključitvi headerja inicializiramo samo hamburger menu
                if (file === 'header.html') {
                    console.log('📌 Header naložen, inicializiram hamburger menu...');
                    initHamburgerMenu();
                }
            } else {
                console.error('Napaka pri nalaganju:', file);
                element.innerHTML = `<p style="color: red; text-align: center;">Napaka pri nalaganju ${file}</p>`;
            }
        } catch (error) {
            console.error('Napaka pri nalaganju:', error);
            element.innerHTML = `<p style="color: red; text-align: center;">Napaka pri nalaganju ${file}</p>`;
        }
    }
}

// Funkcija za inicializacijo hamburger menija
function initHamburgerMenu() {
    // Poiščemo elemente
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    
    // Preverimo, ali elementi obstajajo
    if (hamburger && nav) {
        // Odstranimo morebitne stare event listenerje
        const newHamburger = hamburger.cloneNode(true);
        const newNav = nav.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        nav.parentNode.replaceChild(newNav, nav);
        
        // Ponovno poiščemo elemente po kloniranju
        const finalHamburger = document.getElementById('hamburger');
        const finalNav = document.getElementById('nav');
        
        // Ko kliknemo na hamburger gumb
        finalHamburger.addEventListener('click', function(event) {
            event.stopPropagation();
            finalHamburger.classList.toggle('active');
            finalNav.classList.toggle('active');
            
            if (finalNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.classList.add('menu-open');
            } else {
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            }
        });
        
        // Zapri meni, ko kliknemo na katerikoli link v meniju
        const navLinks = finalNav.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                finalHamburger.classList.remove('active');
                finalNav.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            });
        });
        
        // Zapri meni, ko kliknemo zunaj menija
        document.addEventListener('click', function(event) {
            const isClickInside = finalNav.contains(event.target) || finalHamburger.contains(event.target);
            
            if (!isClickInside && finalNav.classList.contains('active')) {
                finalHamburger.classList.remove('active');
                finalNav.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            }
        });
        
        // Zapri meni, ko se zaslon poveča čez 900px
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900) {
                finalHamburger.classList.remove('active');
                finalNav.classList.remove('active');
                document.body.style.overflow = '';
                document.body.classList.remove('menu-open');
            }
        });
        
        console.log('✅ Hamburger menu inicializiran');
    } else {
        console.warn('⚠️ Hamburger menu elementi niso najdeni');
    }
}

// Dodamo overlay ozadje za meni
function addMenuOverlay() {
    const style = document.createElement('style');
    style.textContent = `
        body.menu-open::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        body.menu-open main,
        body.menu-open footer {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// Funkcija za inicializacijo cookie bannera
function initCookieBanner() {
    // Vaša koda za cookie banner
    console.log('🍪 Cookie banner inicializiran');
}

// Preveri povezavo z backendom
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('✅ Backend povezava:', data);
        return true;
    } catch (error) {
        console.warn('⚠️ Backend ni dosegljiv:', error);
        return false;
    }
}

// Pomožna funkcija za prikaz napak
function showErrorMessage(message, containerId = 'projects-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML += `
            <div style="background: #ffebee; color: #c62828; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <strong>Napaka:</strong> ${message}
            </div>
        `;
    }
}

// ============================================
// FUNKCIJE ZA REFERENCE (PROJEKTI)
// ============================================

// Naloži vse projekte
async function loadProjects() {
    try {
        console.log('📥 Nalagam vse projekte...');
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log('✅ Naloženih projektov:', projects.length);
        
        // Združi projekte po kategorijah
        const projectsByCategory = {};
        projects.forEach(project => {
            const category = project.kategorija;
            if (!projectsByCategory[category]) {
                projectsByCategory[category] = [];
            }
            projectsByCategory[category].push(project);
        });
        
        displayProjectsByCategory(projectsByCategory);
        displayProjectGallery(projects);
        displayProjectsList(projectsByCategory);
    } catch (error) {
        console.error('❌ Napaka pri nalaganju projektov:', error);
        showErrorMessage('Napaka pri nalaganju projektov. Preverite povezavo z strežnikom.');
    }
}

// Naloži projekte po kategoriji
async function loadProjectsByCategory(category) {
    try {
        console.log(`📥 Nalagam projekte za kategorijo: ${category}`);
        const response = await fetch(`/api/projects/category/${encodeURIComponent(category)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const projects = await response.json();
        
        const projectsByCategory = {
            [category]: projects
        };
        
        displayProjectsByCategory(projectsByCategory);
        
        // Posodobi tudi seznam
        const allProjects = await fetch('/api/projects').then(res => res.json());
        const allProjectsByCategory = {};
        allProjects.forEach(project => {
            const cat = project.kategorija;
            if (!allProjectsByCategory[cat]) {
                allProjectsByCategory[cat] = [];
            }
            allProjectsByCategory[cat].push(project);
        });
        displayProjectsList(allProjectsByCategory);
        
    } catch (error) {
        console.error('❌ Napaka pri nalaganju projektov po kategoriji:', error);
        showErrorMessage('Napaka pri nalaganju projektov.');
    }
}

// Naloži kategorije za gumbe
async function loadCategories() {
    try {
        console.log('📥 Nalagam kategorije...');
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const categories = await response.json();
        console.log('✅ Naloženih kategorij:', categories.length);
        
        const filterContainer = document.querySelector('.filter-buttons');
        if (filterContainer) {
            // Dodamo kategorije kot gumbe (razen že obstoječih)
            categories.forEach(category => {
                if (!document.querySelector(`[data-filter="${category}"]`)) {
                    const btn = document.createElement('button');
                    btn.className = 'filter-btn';
                    btn.setAttribute('data-filter', category);
                    btn.textContent = category;
                    
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        loadProjectsByCategory(category);
                    });
                    
                    filterContainer.appendChild(btn);
                }
            });
        }
    } catch (error) {
        console.error('❌ Napaka pri nalaganju kategorij:', error);
    }
}

// Prikaži projekte razporejene po kategorijah (zgornji del)
function displayProjectsByCategory(projectsByCategory) {
    const container = document.getElementById('projects-categories');
    if (!container) return;
    
    let html = '';
    
    for (const [category, projects] of Object.entries(projectsByCategory)) {
        html += `
            <div class="project-category">
                <h3 class="category-title">${category}</h3>
                <ul class="project-list">
        `;
        
        projects.forEach(project => {
            const mesec = project.datum_izdelave?.mesec || 1;
            const leto = project.datum_izdelave?.leto || 'N/A';
            const datum = `${mesec}. ${leto}`;
            
            html += `
                <li>
                    <span>${project.ime_projekta} - ${project.opravljena_dela}</span>
                    <span class="year">${datum}</span>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Prikaži seznam projektov po kategorijah (spodnji del)
function displayProjectsList(projectsByCategory) {
    const container = document.getElementById('projects-list');
    if (!container) return;
    
    let html = '';
    
    for (const [category, projects] of Object.entries(projectsByCategory)) {
        html += `
            <div class="project-category">
                <h3 class="category-title">${category}</h3>
                <ul class="project-list">
        `;
        
        projects.forEach(project => {
            const mesec = project.datum_izdelave?.mesec || 1;
            const leto = project.datum_izdelave?.leto || 'N/A';
            const datum = `${mesec}. ${leto}`;
            
            html += `
                <li>
                    <span>${project.ime_projekta} - ${project.opravljena_dela}</span>
                    <span class="year">${datum}</span>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Prikaži galerijo projektov (zgornji del s slikami)
function displayProjectGallery(projects) {
    const galleryContainer = document.querySelector('#projects-container .gallery-grid');
    if (!galleryContainer) return;
    
    // Vzamemo prvih 5 projektov za galerijo
    const featuredProjects = projects.slice(0, 5);
    
    let galleryHtml = '';
    
    featuredProjects.forEach(project => {
        // Če ni slike, uporabimo placeholder
        const imageUrl = project.slike && project.slike[0] ? 
            project.slike[0] : 
            'slike/projekti/placeholder.jpg';
        
        galleryHtml += `
            <div class="gallery-item" style="border-radius: 10px; overflow: hidden; box-shadow: var(--shadow);">
                <img src="${imageUrl}" alt="${project.ime_projekta}" style="width: 100%; height: 200px; object-fit: cover;">
                <div style="padding: 15px; background: white;">
                    <h4 style="color: var(--primary); margin-bottom: 10px;">${project.ime_projekta}</h4>
                    <p style="font-size: 14px; color: var(--text-light);">${project.kategorija}</p>
                </div>
            </div>
        `;
    });
    
    galleryContainer.innerHTML = galleryHtml;
}

// Naloži projekte iz APIja (stara funkcija, ohranjena za kompatibilnost)
async function loadProjectsOld(containerId, filters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Nalagam projekte...</p>
        </div>
    `;
    
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/projects${queryParams ? '?' + queryParams : ''}`;
        
        const response = await fetch(url);
        const projects = await response.json();
        
        if (projects.length === 0) {
            container.innerHTML = '<p class="text-center">Trenutno ni projektov za prikaz.</p>';
            return;
        }
        
        let html = '<div class="card-grid">';
        
        projects.forEach(project => {
            html += `
                <div class="card">
                    <div class="card-image">
                        <img src="slike/${project.image || 'placeholder.jpg'}" 
                             alt="${project.title}">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${project.title}</h3>
                        <div class="card-meta">
                            <span>📍 ${project.location || 'Ni podatka'}</span>
                            <span>📅 ${project.year || 'Ni podatka'}</span>
                        </div>
                        <p class="card-text">${project.description || ''}</p>
                        ${project.details ? `
                            <div class="card-details">
                                <strong>Podrobnosti:</strong> ${project.details}
                            </div>
                        ` : ''}
                        ${project.materials ? `
                            <div class="card-materials">
                                <strong>Material:</strong> ${project.materials.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Napaka pri nalaganju projektov:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>❌ Napaka pri nalaganju projektov. Prosimo, poskusite kasneje.</p>
                <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// Naloži statistiko
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        
        document.querySelectorAll('[data-stat]').forEach(el => {
            const statKey = el.getAttribute('data-stat');
            if (stats[statKey] !== undefined) {
                el.textContent = stats[statKey];
            }
        });
        
        return stats;
    } catch (error) {
        console.error('Napaka pri nalaganju statistike:', error);
    }
}

// Pošlji kontaktni obrazec
async function submitContactForm(formData) {
    try {
        const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            return true;
        } else {
            alert('Napaka pri pošiljanju. Prosimo, poskusite kasneje.');
            return false;
        }
    } catch (error) {
        console.error('Napaka pri pošiljanju:', error);
        alert('Napaka pri pošiljanju. Preverite internetno povezavo.');
        return false;
    }
}

// ============================================
// INICIALIZACIJA OB NALAGANJU STRANI
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 Stran se nalaga...');
    
    // Najprej vključi header in footer
    await includeHTML();
    addMenuOverlay();
    
    // Nato inicializiraj ostale funkcije
    checkBackendConnection();
    initCookieBanner();
    
    // Preverimo kje smo - glede na URL
    const path = window.location.pathname;
    console.log('📍 Trenutna pot:', path);
    
    // Če smo na strani z referencami
    if (path.includes('references.html') || document.getElementById('projects-container')) {
        console.log('🔍 Na strani Reference, nalagam projekte...');
        loadProjects();
        loadCategories();
        
        // Event listenerji za gumbe (za vsak primer, če so že v HTML)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-filter');
                if (category === 'all') {
                    loadProjects();
                } else {
                    loadProjectsByCategory(category);
                }
            });
        });
    }
    
    // Če smo na strani z referencami in imamo filter gumbe (stari način)
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = btn.getAttribute('data-filter');
            const filters = filter === 'all' ? {} : { category: filter };
            loadProjectsOld('projects-container', filters);
            
            // Označi aktivni filter
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});