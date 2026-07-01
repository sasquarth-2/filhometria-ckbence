let friendsData = [];

document.addEventListener('DOMContentLoaded', () => {
  loadData();
});

async function loadData() {
  try {
    const response = await fetch('friends.json');
    if (!response.ok) throw new Error('Não foi possível carregar o arquivo friends.json');
    friendsData = await response.json();
    renderLeaderboard();
  } catch (error) {
    console.error('Erro ao ler friends.json:', error);
    document.getElementById('leaderboard-list').innerHTML = `
      <div class="error-container">
        <span class="error-icon">⚠️</span>
        <h3>Não foi possível carregar os herdeiros</h3>
        <p>Por questões de segurança (CORS), os navegadores modernos bloqueiam o carregamento de arquivos JSON locais quando a página é aberta diretamente com dois cliques (usando <code>file://</code> no navegador).</p>
        <div class="tip-box">
          <strong>Como rodar a página corretamente:</strong>
          <ol>
            <li>Instale e use a extensão <strong>Live Server</strong> no VS Code</li>
            <li>Ou abra o terminal nesta pasta e execute:
              <pre>npx serve .</pre>
            </li>
          </ol>
        </div>
      </div>
    `;
  }
}

// Render the leaderboard cards
function renderLeaderboard() {
  const listContainer = document.getElementById('leaderboard-list');
  const totalStats = document.getElementById('total-stats');
  
  if (!listContainer) return;
  
  // Sort friends by number of children descending
  // If tied, sort alphabetically by name
  friendsData.sort((a, b) => {
    const lenA = a.children ? a.children.length : 0;
    const lenB = b.children ? b.children.length : 0;
    if (lenB !== lenA) {
      return lenB - lenA;
    }
    return a.name.localeCompare(b.name);
  });

  let totalChildren = 0;
  listContainer.innerHTML = '';

  friendsData.forEach((friend, index) => {
    const rank = index + 1;
    const childCount = friend.children ? friend.children.length : 0;
    totalChildren += childCount;
    
    // Create card element
    const card = document.createElement('div');
    card.className = `friend-card rank-${rank}`;
    card.setAttribute('data-id', friend.id || index);
    
    // Set emoji/badge based on type of child
    const badgesHtml = friend.children && friend.children.length > 0 
      ? friend.children.map(child => {
          const name = typeof child === 'string' ? child : child.name;
          const type = (typeof child === 'object' && child.type) ? child.type : 'Objeto';
          const typeClass = `type-${type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
          const typeEmoji = getEmojiForType(type);
          return `
            <span class="child-badge ${typeClass}">
              <span>${typeEmoji}</span>
              <strong>${name}</strong>
              <small>(${type})</small>
            </span>
          `;
        }).join('')
      : `<span style="color: var(--text-secondary); font-style: italic; font-size: 0.9rem;">Sem herdeiros ainda 😢</span>`;

    // Determine profile photo or initials
    const initials = friend.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const photoHtml = friend.photo 
      ? `<div class="profile-container">
          <img src="${friend.photo}" class="profile-img" alt="${friend.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="profile-placeholder" style="display: none;">${initials}</div>
          <div class="rank-badge-overlay">${rank}</div>
         </div>`
      : `<div class="profile-container">
          <div class="profile-placeholder">${initials}</div>
          <div class="rank-badge-overlay">${rank}</div>
         </div>`;

    card.innerHTML = `
      ${photoHtml}
      <div class="friend-info">
        <div class="friend-meta">
          <span class="friend-name">${friend.name}</span>
          <span class="children-count">${childCount} ${childCount === 1 ? 'filho' : 'filhos'}</span>
        </div>
        <div class="children-container">
          ${badgesHtml}
        </div>
      </div>
    `;
    
    listContainer.appendChild(card);
  });

  if (totalStats) {
    totalStats.textContent = `Total de Filhos Registrados: ${totalChildren}`;
  }
}

// Helpers
function getEmojiForType(type) {
  const normType = type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (normType.includes('pet') || normType.includes('cao') || normType.includes('gato') || normType.includes('animal')) return '🐾';
  if (normType.includes('maquina') || normType.includes('console') || normType.includes('pc') || normType.includes('computador') || normType.includes('tech')) return '🤖';
  if (normType.includes('eletro') || normType.includes('aspirador') || normType.includes('microondas') || normType.includes('geladeira')) return '🔌';
  if (normType.includes('planta') || normType.includes('cacto') || normType.includes('flor') || normType.includes('arvore')) return '🌱';
  if (normType.includes('carro') || normType.includes('veiculo') || normType.includes('moto') || normType.includes('bike')) return '🚗';
  if (normType.includes('humano') || normType.includes('pessoa') || normType.includes('bebe')) return '👶';
  return '🎒';
}
