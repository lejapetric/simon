// API base URL - spremenite glede na vaš backend
const API_BASE = 'http://localhost:3000/api';

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

// Naloži projekte iz APIja
async function loadProjects(containerId, filters = {}) {
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

// Funkcija za inicializacijo cookie bannera
function initCookieBanner() {
    // Vaša koda za cookie banner
}

// Inicializacija ob nalaganju strani
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 Stran se nalaga...');
    
    // Najprej vključi header in footer
    await includeHTML();
    
    // Nato inicializiraj ostale funkcije
    checkBackendConnection();
    initCookieBanner();
    
    // Če smo na strani z referencami, naloži projekte
    if (document.getElementById('projects-container')) {
        const category = new URLSearchParams(window.location.search).get('category');
        loadProjects('projects-container', category ? { category } : {});
    }
    
    // Če smo na strani z referencami in imamo filter gumbe
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = btn.getAttribute('data-filter');
            const filters = filter === 'all' ? {} : { category: filter };
            loadProjects('projects-container', filters);
            
            // Označi aktivni filter
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

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

// Pokličemo funkcijo za dodajanje overlay stila
addMenuOverlay();