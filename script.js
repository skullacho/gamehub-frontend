/**
 * GameHub — Lógica Frontend em JavaScript Puro (Vanilla JS)
 * Integrantes: Arthur Nunes de Souza Possato, Enzo Marques Cardona, Pedro Sante Maria Bueno Silva
 */

// ==========================================================================
// 1. Configurações Globais da API
// ==========================================================================
const API_BASE_URL = window.GAMEHUB_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api');

const DEFAULT_COVER = 'assets/default-cover.svg';

// Estado global da aplicação
const state = {
  jogos: [],
  isLoading: false,
  filtros: {
    busca: '',
    genero: 'todos',
    plataforma: 'todas',
    ordenar: 'recentes',
  },
  editingGameId: null,
  deletingGameId: null,
  deletingGameName: '',
};

// ==========================================================================
// 2. Elementos do DOM
// ==========================================================================
const elements = {
  // Status da API
  apiStatusBadge: document.getElementById('apiStatusBadge'),

  // Header & Hero
  btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),
  totalGamesStat: document.getElementById('totalGamesStat'),

  // Controles de Busca e Filtros
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  genreFilter: document.getElementById('genreFilter'),
  platformFilter: document.getElementById('platformFilter'),
  sortOrder: document.getElementById('sortOrder'),
  btnResetFilters: document.getElementById('btnResetFilters'),

  // Catálogo
  catalogCounter: document.getElementById('catalogCounter'),
  gamesGrid: document.getElementById('gamesGrid'),
  loadingState: document.getElementById('loadingState'),
  emptyState: document.getElementById('emptyState'),
  emptyDescription: document.getElementById('emptyDescription'),
  btnEmptyAction: document.getElementById('btnEmptyAction'),

  // Modal de Criação / Edição
  gameModal: document.getElementById('gameModal'),
  gameForm: document.getElementById('gameForm'),
  modalTitle: document.getElementById('modalTitle'),
  btnCloseGameModal: document.getElementById('btnCloseGameModal'),
  btnCancelGameModal: document.getElementById('btnCancelGameModal'),
  btnSubmitGame: document.getElementById('btnSubmitGame'),
  submitBtnText: document.getElementById('submitBtnText'),
  submitBtnSpinner: document.getElementById('submitBtnSpinner'),

  // Campos do Formulário
  gameId: document.getElementById('gameId'),
  inputNome: document.getElementById('inputNome'),
  inputDesenvolvedora: document.getElementById('inputDesenvolvedora'),
  inputGenero: document.getElementById('inputGenero'),
  inputPlataforma: document.getElementById('inputPlataforma'),
  inputPreco: document.getElementById('inputPreco'),
  inputAno: document.getElementById('inputAno'),
  inputImagem: document.getElementById('inputImagem'),
  inputDescricao: document.getElementById('inputDescricao'),

  // Campos de Erro de Validação
  errorNome: document.getElementById('errorNome'),
  errorDesenvolvedora: document.getElementById('errorDesenvolvedora'),
  errorGenero: document.getElementById('errorGenero'),
  errorPlataforma: document.getElementById('errorPlataforma'),
  errorPreco: document.getElementById('errorPreco'),
  errorAno: document.getElementById('errorAno'),
  errorImagem: document.getElementById('errorImagem'),
  errorDescricao: document.getElementById('errorDescricao'),

  // Modal de Detalhes
  detailsModal: document.getElementById('detailsModal'),
  detailsBody: document.getElementById('detailsBody'),
  btnCloseDetailsModal: document.getElementById('btnCloseDetailsModal'),
  btnCloseDetails: document.getElementById('btnCloseDetails'),
  btnEditFromDetails: document.getElementById('btnEditFromDetails'),

  // Modal de Exclusão
  deleteModal: document.getElementById('deleteModal'),
  deleteGameName: document.getElementById('deleteGameName'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),
  deleteBtnSpinner: document.getElementById('deleteBtnSpinner'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer'),
};

// ==========================================================================
// 3. Inicialização
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkApiHealth();
  fetchGames();
});

// ==========================================================================
// 4. Verificação de Saúde da API (Health Check)
// ==========================================================================
async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      updateApiStatus(true, data.database === 'conectado' ? 'API Online' : 'API Online (DB Alerta)');
    } else {
      updateApiStatus(false, 'API Instável');
    }
  } catch (error) {
    updateApiStatus(false, 'API Offline');
  }
}

function updateApiStatus(isOnline, label) {
  if (!elements.apiStatusBadge) return;
  const dot = elements.apiStatusBadge.querySelector('.status-dot');
  const text = elements.apiStatusBadge.querySelector('.status-label');

  dot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
  text.textContent = label;
}

// ==========================================================================
// 5. Comunicação com a API (CRUD)
// ==========================================================================

/**
 * Busca jogos na API aplicando busca, filtros e ordenação
 */
async function fetchGames() {
  showLoading(true);

  try {
    const params = new URLSearchParams();
    if (state.filtros.busca) params.append('busca', state.filtros.busca);
    if (state.filtros.genero && state.filtros.genero !== 'todos') {
      params.append('genero', state.filtros.genero);
    }
    if (state.filtros.plataforma && state.filtros.plataforma !== 'todas') {
      params.append('plataforma', state.filtros.plataforma);
    }
    if (state.filtros.ordenar && state.filtros.ordenar !== 'recentes') {
      params.append('ordenar', state.filtros.ordenar);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/jogos${queryString}`);

    if (!res.ok) {
      throw new Error(`Erro ${res.status}: Não foi possível carregar os jogos.`);
    }

    const data = await res.json();
    state.jogos = data.dados || [];

    renderGames(state.jogos);
    updateStats(state.jogos.length);
  } catch (error) {
    console.error('[Fetch Games Error]', error);
    showToast(error.message || 'Falha ao conectar com o servidor.', 'error');
    renderGames([]);
    elements.catalogCounter.textContent = 'Erro ao carregar catálogo';
  } finally {
    showLoading(false);
  }
}

/**
 * Busca um único jogo por ID para edição ou detalhes
 */
async function getGameById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/jogos/${id}`);
    if (!res.ok) throw new Error('Não foi possível obter os dados do jogo.');
    const data = await res.json();
    return data.dados;
  } catch (error) {
    showToast(error.message, 'error');
    return null;
  }
}

/**
 * Salva um novo jogo ou atualiza um jogo existente
 */
async function handleGameFormSubmit(event) {
  event.preventDefault();

  if (!validateGameForm()) {
    showToast('Por favor, preencha corretamente os campos obrigatórios.', 'error');
    return;
  }

  setFormSubmitting(true);

  const payload = {
    nome: elements.inputNome.value.trim(),
    desenvolvedora: elements.inputDesenvolvedora.value.trim(),
    genero: elements.inputGenero.value,
    plataforma: elements.inputPlataforma.value,
    preco: elements.inputPreco.value ? parseFloat(elements.inputPreco.value) : 0,
    anoLancamento: elements.inputAno.value ? parseInt(elements.inputAno.value, 10) : undefined,
    imagem: elements.inputImagem.value.trim(),
    descricao: elements.inputDescricao.value.trim(),
  };

  const isEditing = Boolean(state.editingGameId);
  const endpoint = isEditing ? `${API_BASE_URL}/jogos/${state.editingGameId}` : `${API_BASE_URL}/jogos`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.erros ? data.erros.join(', ') : data.mensagem || 'Falha ao salvar jogo.';
      throw new Error(errorMsg);
    }

    showToast(isEditing ? 'Jogo atualizado com sucesso!' : 'Jogo cadastrado com sucesso!', 'success');
    closeModal(elements.gameModal);
    resetGameForm();
    await fetchGames();
  } catch (error) {
    console.error('[Submit Error]', error);
    showToast(error.message, 'error');
  } finally {
    setFormSubmitting(false);
  }
}

/**
 * Executa a exclusão de um jogo da base de dados
 */
async function handleConfirmDelete() {
  if (!state.deletingGameId) return;

  setDeleteSubmitting(true);

  try {
    const res = await fetch(`${API_BASE_URL}/jogos/${state.deletingGameId}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensagem || 'Falha ao excluir o jogo.');
    }

    showToast(`Jogo "${state.deletingGameName}" excluído com sucesso!`, 'success');
    closeModal(elements.deleteModal);
    state.deletingGameId = null;
    state.deletingGameName = '';
    await fetchGames();
  } catch (error) {
    console.error('[Delete Error]', error);
    showToast(error.message, 'error');
  } finally {
    setDeleteSubmitting(false);
  }
}

// ==========================================================================
// 6. Renderização da Interface
// ==========================================================================

/**
 * Renderiza o grid de jogos
 */
function renderGames(jogos) {
  elements.gamesGrid.innerHTML = '';

  if (!jogos || jogos.length === 0) {
    elements.emptyState.style.display = 'flex';
    elements.catalogCounter.textContent = '0 jogos exibidos';

    if (state.filtros.busca || state.filtros.genero !== 'todos' || state.filtros.plataforma !== 'todas') {
      elements.emptyDescription.textContent =
        'Nenhum jogo corresponde aos filtros selecionados. Tente limpar os filtros ou realizar outra busca.';
    } else {
      elements.emptyDescription.textContent =
        'Ainda não há jogos cadastrados na sua biblioteca. Seja o primeiro a cadastrar um jogo!';
    }
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.catalogCounter.textContent = `${jogos.length} ${jogos.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;

  jogos.forEach((jogo) => {
    const card = createGameCardElement(jogo);
    elements.gamesGrid.appendChild(card);
  });
}

/**
 * Cria o elemento HTML de um Card de Jogo
 */
function createGameCardElement(jogo) {
  const card = document.createElement('article');
  card.className = 'game-card';
  card.dataset.id = jogo._id;

  const precoFormatado =
    jogo.preco && jogo.preco > 0
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(jogo.preco)
      : 'Gratuito';

  const isFree = !jogo.preco || jogo.preco === 0;
  const coverUrl = jogo.imagem && jogo.imagem.trim() ? jogo.imagem.trim() : DEFAULT_COVER;

  card.innerHTML = `
    <div class="card-cover-wrapper">
      <img
        src="${escapeHtml(coverUrl)}"
        alt="Capa do jogo ${escapeHtml(jogo.nome)}"
        class="card-cover-img"
        loading="lazy"
        onerror="this.onerror=null;this.src='${DEFAULT_COVER}';"
      >
      <div class="card-badges-overlay">
        <span class="badge badge-genre">${escapeHtml(jogo.genero)}</span>
        <span class="badge badge-platform">${escapeHtml(jogo.plataforma)}</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="card-title" title="${escapeHtml(jogo.nome)}">${escapeHtml(jogo.nome)}</h3>
      <div class="card-developer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span>${escapeHtml(jogo.desenvolvedora)}</span>
      </div>

      <div class="card-meta-row">
        <span class="card-price ${isFree ? 'free' : ''}">${precoFormatado}</span>
        ${jogo.anoLancamento ? `<span class="card-year">${jogo.anoLancamento}</span>` : ''}
      </div>
    </div>

    <div class="card-actions">
      <button class="btn-card-action details" data-id="${jogo._id}" title="Ver detalhes completos">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Detalhes</span>
      </button>

      <button class="btn-card-action edit" data-id="${jogo._id}" title="Editar jogo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>Editar</span>
      </button>

      <button class="btn-card-action delete" data-id="${jogo._id}" data-nome="${escapeHtml(jogo.nome)}" title="Excluir jogo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>Excluir</span>
      </button>
    </div>
  `;

  // Vincula eventos nos botões do Card
  card.querySelector('.details').addEventListener('click', () => openDetailsModal(jogo._id));
  card.querySelector('.edit').addEventListener('click', () => openEditModal(jogo._id));
  card.querySelector('.delete').addEventListener('click', () => openDeleteModal(jogo._id, jogo.nome));

  return card;
}

/**
 * Atualiza o contador de jogos no Hero
 */
function updateStats(total) {
  if (elements.totalGamesStat) {
    elements.totalGamesStat.textContent = total;
  }
}

/**
 * Exibe ou oculta o indicador de carregamento
 */
function showLoading(show) {
  state.isLoading = show;
  elements.loadingState.style.display = show ? 'flex' : 'none';
  if (show) {
    elements.emptyState.style.display = 'none';
  }
}

// ==========================================================================
// 7. Modais e Formulários
// ==========================================================================

/**
 * Abre o modal para cadastro de um novo jogo
 */
function openCreateModal() {
  state.editingGameId = null;
  resetGameForm();
  elements.modalTitle.textContent = 'Cadastrar Novo Jogo';
  elements.submitBtnText.textContent = 'Salvar Jogo';
  openModal(elements.gameModal);
  elements.inputNome.focus();
}

/**
 * Abre o modal preenchendo automaticamente os dados existentes para edição
 */
async function openEditModal(id) {
  resetGameForm();
  state.editingGameId = id;
  elements.modalTitle.textContent = 'Editar Jogo';
  elements.submitBtnText.textContent = 'Salvar Alterações';

  const jogo = state.jogos.find((j) => j._id === id) || (await getGameById(id));
  if (!jogo) return;

  elements.gameId.value = jogo._id;
  elements.inputNome.value = jogo.nome || '';
  elements.inputDesenvolvedora.value = jogo.desenvolvedora || '';
  elements.inputGenero.value = jogo.genero || '';
  elements.inputPlataforma.value = jogo.plataforma || '';
  elements.inputPreco.value = jogo.preco !== undefined ? jogo.preco : '';
  elements.inputAno.value = jogo.anoLancamento || '';
  elements.inputImagem.value = jogo.imagem || '';
  elements.inputDescricao.value = jogo.descricao || '';

  openModal(elements.gameModal);
  elements.inputNome.focus();
}

/**
 * Abre o modal exibindo detalhes completos do jogo
 */
async function openDetailsModal(id) {
  const jogo = state.jogos.find((j) => j._id === id) || (await getGameById(id));
  if (!jogo) return;

  const precoFormatado =
    jogo.preco && jogo.preco > 0
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(jogo.preco)
      : 'Gratuito';

  const coverUrl = jogo.imagem && jogo.imagem.trim() ? jogo.imagem.trim() : DEFAULT_COVER;
  const dataCriacao = jogo.createdAt ? new Date(jogo.createdAt).toLocaleDateString('pt-BR') : 'N/A';

  elements.detailsBody.innerHTML = `
    <div class="details-banner">
      <img
        src="${escapeHtml(coverUrl)}"
        alt="Capa de ${escapeHtml(jogo.nome)}"
        class="details-img"
        onerror="this.onerror=null;this.src='${DEFAULT_COVER}';"
      >
    </div>

    <div class="details-info-grid">
      <div class="details-item">
        <div class="details-item-label">Nome do Jogo</div>
        <div class="details-item-value">${escapeHtml(jogo.nome)}</div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Desenvolvedora</div>
        <div class="details-item-value">${escapeHtml(jogo.desenvolvedora)}</div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Gênero</div>
        <div class="details-item-value">
          <span class="badge badge-genre">${escapeHtml(jogo.genero)}</span>
        </div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Plataforma</div>
        <div class="details-item-value">
          <span class="badge badge-platform">${escapeHtml(jogo.plataforma)}</span>
        </div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Preço Estimado</div>
        <div class="details-item-value" style="color: var(--accent-green); font-family: var(--font-display);">
          ${precoFormatado}
        </div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Ano de Lançamento</div>
        <div class="details-item-value">${jogo.anoLancamento || 'Não informado'}</div>
      </div>

      <div class="details-item">
        <div class="details-item-label">Cadastrado em</div>
        <div class="details-item-value">${dataCriacao}</div>
      </div>
    </div>

    <div class="details-description-box">
      <div class="details-item-label">Sinopse / Descrição</div>
      <p class="details-description-text">
        ${jogo.descricao && jogo.descricao.trim() ? escapeHtml(jogo.descricao) : 'Nenhuma descrição detalhada informada.'}
      </p>
    </div>
  `;

  // Configura ação do botão de editar dentro do modal de detalhes
  elements.btnEditFromDetails.onclick = () => {
    closeModal(elements.detailsModal);
    openEditModal(jogo._id);
  };

  openModal(elements.detailsModal);
}

/**
 * Abre o modal de confirmação de exclusão
 */
function openDeleteModal(id, nome) {
  state.deletingGameId = id;
  state.deletingGameName = nome;
  elements.deleteGameName.textContent = `"${nome}"`;
  openModal(elements.deleteModal);
}

function openModal(modal) {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function resetGameForm() {
  elements.gameForm.reset();
  elements.gameId.value = '';
  clearValidationErrors();
}

// ==========================================================================
// 8. Validação de Formulário
// ==========================================================================
function validateGameForm() {
  clearValidationErrors();
  let isValid = true;

  // Validação: Nome
  const nome = elements.inputNome.value.trim();
  if (!nome) {
    setFieldError(elements.inputNome, elements.errorNome, 'O nome do jogo é obrigatório.');
    isValid = false;
  } else if (nome.length > 120) {
    setFieldError(elements.inputNome, elements.errorNome, 'O nome deve ter no máximo 120 caracteres.');
    isValid = false;
  }

  // Validação: Desenvolvedora
  const dev = elements.inputDesenvolvedora.value.trim();
  if (!dev) {
    setFieldError(elements.inputDesenvolvedora, elements.errorDesenvolvedora, 'A desenvolvedora é obrigatória.');
    isValid = false;
  } else if (dev.length > 100) {
    setFieldError(elements.inputDesenvolvedora, elements.errorDesenvolvedora, 'Máximo de 100 caracteres.');
    isValid = false;
  }

  // Validação: Gênero
  if (!elements.inputGenero.value) {
    setFieldError(elements.inputGenero, elements.errorGenero, 'Selecione um gênero válido.');
    isValid = false;
  }

  // Validação: Plataforma
  if (!elements.inputPlataforma.value) {
    setFieldError(elements.inputPlataforma, elements.errorPlataforma, 'Selecione uma plataforma válida.');
    isValid = false;
  }

  // Validação: Preço
  if (elements.inputPreco.value !== '') {
    const preco = parseFloat(elements.inputPreco.value);
    if (isNaN(preco) || preco < 0) {
      setFieldError(elements.inputPreco, elements.errorPreco, 'O preço deve ser igual ou maior que zero.');
      isValid = false;
    }
  }

  // Validação: Ano
  if (elements.inputAno.value !== '') {
    const ano = parseInt(elements.inputAno.value, 10);
    const anoMax = new Date().getFullYear() + 5;
    if (isNaN(ano) || ano < 1950 || ano > anoMax) {
      setFieldError(elements.inputAno, elements.errorAno, `O ano deve ser entre 1950 e ${anoMax}.`);
      isValid = false;
    }
  }

  // Validação: URL de imagem
  if (elements.inputImagem.value.trim() !== '') {
    try {
      new URL(elements.inputImagem.value.trim());
    } catch {
      setFieldError(elements.inputImagem, elements.errorImagem, 'Informe uma URL válida (ex: https://...).');
      isValid = false;
    }
  }

  return isValid;
}

function setFieldError(input, errorElement, message) {
  input.classList.add('is-invalid');
  errorElement.textContent = message;
}

function clearValidationErrors() {
  const inputs = elements.gameForm.querySelectorAll('.form-control');
  inputs.forEach((input) => input.classList.remove('is-invalid'));

  const errors = elements.gameForm.querySelectorAll('.field-error');
  errors.forEach((err) => (err.textContent = ''));
}

function setFormSubmitting(isSubmitting) {
  elements.btnSubmitGame.disabled = isSubmitting;
  elements.btnCancelGameModal.disabled = isSubmitting;
  elements.submitBtnSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
  elements.submitBtnText.textContent = isSubmitting ? 'Salvando...' : state.editingGameId ? 'Salvar Alterações' : 'Salvar Jogo';
}

function setDeleteSubmitting(isSubmitting) {
  elements.btnConfirmDelete.disabled = isSubmitting;
  elements.btnCancelDelete.disabled = isSubmitting;
  elements.deleteBtnSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
}

// ==========================================================================
// 9. Sistema de Toasts (Notificações Flutuantes)
// ==========================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    `;
  } else if (type === 'error') {
    iconSvg = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    `;
  } else {
    iconSvg = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    `;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Auto remover após 4 segundos com animação de saída
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================================
// 10. Event Listeners e Controles Interativos
// ==========================================================================
function setupEventListeners() {
  // Abertura de Modal de Cadastro
  elements.btnOpenCreateModal.addEventListener('click', openCreateModal);
  elements.btnEmptyAction.addEventListener('click', openCreateModal);

  // Fechamento de Modais
  elements.btnCloseGameModal.addEventListener('click', () => closeModal(elements.gameModal));
  elements.btnCancelGameModal.addEventListener('click', () => closeModal(elements.gameModal));
  elements.btnCloseDetailsModal.addEventListener('click', () => closeModal(elements.detailsModal));
  elements.btnCloseDetails.addEventListener('click', () => closeModal(elements.detailsModal));
  elements.btnCancelDelete.addEventListener('click', () => closeModal(elements.deleteModal));

  // Fechar clicando no backdrop escuro
  [elements.gameModal, elements.detailsModal, elements.deleteModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Fechar com tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(elements.gameModal);
      closeModal(elements.detailsModal);
      closeModal(elements.deleteModal);
    }
  });

  // Submissão do Formulário
  elements.gameForm.addEventListener('submit', handleGameFormSubmit);

  // Confirmação de Exclusão
  elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Busca em tempo real com debounce de 350ms
  let searchTimeout = null;
  elements.searchInput.addEventListener('input', (e) => {
    const valor = e.target.value.trim();
    elements.btnClearSearch.style.display = valor ? 'block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filtros.busca = valor;
      fetchGames();
    }, 350);
  });

  // Botão de limpar busca
  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    state.filtros.busca = '';
    fetchGames();
  });

  // Filtro de Gênero
  elements.genreFilter.addEventListener('change', (e) => {
    state.filtros.genero = e.target.value;
    fetchGames();
  });

  // Filtro de Plataforma
  elements.platformFilter.addEventListener('change', (e) => {
    state.filtros.plataforma = e.target.value;
    fetchGames();
  });

  // Ordenação
  elements.sortOrder.addEventListener('change', (e) => {
    state.filtros.ordenar = e.target.value;
    fetchGames();
  });

  // Redefinir todos os filtros
  elements.btnResetFilters.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    elements.genreFilter.value = 'todos';
    elements.platformFilter.value = 'todas';
    elements.sortOrder.value = 'recentes';

    state.filtros = {
      busca: '',
      genero: 'todos',
      plataforma: 'todas',
      ordenar: 'recentes',
    };

    fetchGames();
    showToast('Filtros redefinidos.', 'info');
  });
}

// Utilitário para escapar HTML contra XSS
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
