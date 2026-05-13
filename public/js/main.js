// Глобальные переменные
let map;
let markersLayer;
let currentObjects = [];

// Инициализация карты
function initMap(center, zoom) {
    map = L.map('map').setView([center.lat, center.lng], zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);
    
    markersLayer = L.layerGroup().addTo(map);
}

// Обновление маркеров на карте
function updateMarkers(objects) {
    markersLayer.clearLayers();
    
    objects.forEach(obj => {
        if (obj.latitude && obj.longitude) {
            let markerColor = 'blue';
            let statusText = '';
            
            if (obj.status === 'completed') {
                markerColor = '#4caf50';
                statusText = '✅ Сдан';
            } else if (obj.status === 'building') {
                markerColor = '#00b4a0';
                statusText = '🏗️ Строится';
            } else {
                markerColor = '#ff9800';
                statusText = '📋 Проектируется';
            }
            
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px black;"></div>`,
                iconSize: [12, 12]
            });
            
            const marker = L.marker([parseFloat(obj.latitude), parseFloat(obj.longitude)], {
                icon: customIcon
            }).addTo(markersLayer);
            
            const imageUrl = obj.preview_image ? `/uploads/${obj.preview_image}` : '/uploads/default.jpg';
            
            marker.bindPopup(`
                <div style="min-width: 220px;">
                    <strong>${obj.name}</strong><br>
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; margin: 8px 0; background: ${markerColor}20; color: ${markerColor};">${statusText}</span><br>
                    <img src="${imageUrl}" style="width: 100%; border-radius: 8px; margin: 8px 0; max-height: 120px; object-fit: cover;"><br>
                    <a href="/object/${obj.id}" style="display: inline-block; margin-top: 8px; color: #00b4a0; text-decoration: none;">Подробнее →</a>
                </div>
            `);
        }
    });
}

// Загрузка объектов через API
async function loadObjects(status = 'all') {
    try {
        const response = await fetch(`/api/objects?status=${status}`);
        const result = await response.json();
        
        if (!result.success) throw new Error(result.error);
        
        currentObjects = result.data;
        updateMarkers(currentObjects);
        
        const grid = document.getElementById('objectsGrid');
        
        if (currentObjects.length === 0) {
            grid.innerHTML = '<div class="object-card" style="text-align: center; padding: 3rem; grid-column: 1/-1;">Нет объектов с выбранным статусом</div>';
            return;
        }
        
        grid.innerHTML = currentObjects.map(obj => {
            let statusClass = '';
            let statusText = '';
            
            if (obj.status === 'completed') {
                statusClass = 'status-completed';
                statusText = '✅ Сдан';
            } else if (obj.status === 'building') {
                statusClass = 'status-building';
                statusText = '🏗️ Строится';
            } else {
                statusClass = 'status-planning';
                statusText = '📋 Проектируется';
            }
            
            const imageUrl = obj.preview_image ? `/uploads/${obj.preview_image}` : '/uploads/default.jpg';
            const completionDate = obj.completion_date ? new Date(obj.completion_date).toLocaleDateString('ru-RU') : '—';
            
            return `
                <div class="object-card">
                    <div class="card-image">
                        <img src="${imageUrl}" alt="${obj.name}">
                    </div>
                    <div class="card-content">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <h3 class="card-title">${obj.name}</h3>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="card-address">📍 ${obj.address}</div>
                        <div class="card-stats">
                            <span>🏠 ${obj.floors || '—'} м²</span>
                            ${obj.price_from ? `<span>💰 ${obj.price_from.toLocaleString('ru-RU')} ₽</span>` : ''}
                            <span>📅 ${completionDate}</span>
                        </div>
                        <a href="/object/${obj.id}" class="btn btn-outline">Подробнее →</a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('objectsGrid').innerHTML = '<div class="object-card" style="text-align: center; padding: 3rem; grid-column: 1/-1;">Ошибка загрузки данных</div>';
    }
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли элемент map на странице
    if (document.getElementById('map') && typeof mapCenter !== 'undefined') {
        initMap(mapCenter, mapZoom);
    }
    
    // Проверяем, есть ли фильтр на странице
    const filter = document.getElementById('statusFilter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            loadObjects(e.target.value);
        });
        loadObjects('all');
    }
});