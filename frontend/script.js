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
                
                // Po vključitvi headerja ponovno nastavi aktivni menu
                if (file === 'header.html') {
                    setActiveMenu();
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

// Aktivni menu glede na trenutno stran
function setActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
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
        // Zgradi query string
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
        
        // Posodobi stat elemente na strani
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

// Inicializacija ob nalaganju strani
document.addEventListener('DOMContentLoaded', async () => {
    // Najprej vključi header in footer
    await includeHTML();
    
    // Nato inicializiraj ostale funkcije
    setActiveMenu();
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

// Ponovno zaženi setActiveMenu po morebitnih dinamičnih spremembah
window.addEventListener('popstate', () => {
    setTimeout(setActiveMenu, 100);
});