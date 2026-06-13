/**
 * @file app.js
 * @description Core corporativo de gerenciamento de dados, autenticação local, estado de favoritos, busca e carrinho.
 * @author Andrew Kaique Ferreira de Paula
 * @matricula 927993
 * @version 3.1.0
 */

/* ==========================================================================
   1. BANCO DE DADOS LOCAL (JSON E ENTIDADES MOCK)
   ========================================================================== */

/**
 * @global
 * @type {Object}
 * @description Repositório estrito de dados nativos estruturados da aplicação (Entity Catalog).
 */
const data = {
    produtos: [
        {
            id: 1,
            nome: "Smartphone Ultra",
            preco: 9500.00,
            categoria: "Relogios",
            imagem: "assets/img/smatphone/SmartPhoneUltra.jpg",
            descricao: "Bateria dura 2 dias.",
            conteudo: "Dispositivo premium com tela AMOLED de alta taxa de atualização, ideal para corridas e monitoramento da saúde.",
            emEstoque: true,
            destaque: true,
            fotos_vinculadas: [
                { id: 101, nome: "Vista Frontal da Tela", imagem: "assets/img/smatphone/SmartPhoneUltra.jpg" },
                { id: 102, nome: "Detalhe do Acabamento Lateral", imagem: "assets/img/smatphone/SmartPhoneTraseira.jpg" }
            ]
        },
        {
            id: 2,
            nome: "Notebook Pro",
            preco: 6700.00,
            categoria: "Notebooks",
            imagem: "assets/img/notebook/NotebookDevPro.jpg",
            descricao: "16GB RAM e SSD.",
            conteudo: "Notebook potente voltado para desenvolvedores e profissionais de TI, oferecendo inicialização rápida e excelente desempenho multarefa.",
            emEstoque: true,
            destaque: true,
            fotos_vinculadas: [
                { id: 201, nome: "Design Ultrafino Lateral", imagem: "assets/img/notebook/NotebookDevProLateral.jpg" },
                { id: 202, nome: "Teclado Retroiluminado", imagem: "assets/img/notebook/Teclado.jpg" }
            ]
        },
        {
            id: 3,
            nome: "Teclado Mecânico Wireless",
            preco: 400.00,
            categoria: "Acessórios",
            imagem: "assets/img/teclado/Teclado.jpg",
            descricao: "Switch Blue barulhento e tátil.",
            conteudo: "Teclado mecânico compacto de alto desempenho com iluminação personalizada e switches de alta durabilidade para digitação precisa.",
            emEstoque: true,
            destaque: false,
            fotos_vinculadas: [
                { id: 301, nome: "Layout Compacto ABNT2", imagem: "assets/img/teclado/TecladoMecanico.jpg" }
            ]
        },
        {
            id: 4,
            nome: "Placa de Vídeo AMD",
            preco: 4850.00,
            categoria: "Hardware",
            imagem: "assets/img/placa-de-video/PlacaDeVideo.jpg",
            descricao: "Placa de vídeo de alto desempenho.",
            conteudo: "Componente gráfico ideal para processamento pesado, renderização e execução fluida de aplicações tridimensionais complexas.",
            emEstoque: true,
            destaque: true,
            fotos_vinculadas: [
                { id: 401, nome: "Sistema de Refrigeração Triple Fan", imagem: "assets/img/placa-de-video/TripleFan.jpg" }
            ]
        },
        {
            id: 5,
            nome: "SmartWatch Pro",
            preco: 485.00,
            categoria: "Smart",
            imagem: "assets/img/smartwatch/front.jpg",
            descricao: "Bateria dura 2 dias.",
            conteudo: "Dispositivo premium com tela AMOLED de alta taxa de atualização, ideal para produtividade e entretenimento no dia a dia.",
            emEstoque: true,
            destaque: true,
            fotos_vinculadas: [
                { id: 501, nome: "Vista Frontal da Tela", imagem: "assets/img/smartwatch/front.jpg" },
                { id: 502, nome: "Detalhe do Acabamento Lateral", imagem: "assets/img/smartwatch/side.jpg" }
            ]
        }
    ]
};

/**
 * @constant
 * @type {Array<Object>}
 * @description Provedor de identidades de teste para o sistema de autenticação da aplicação.
 */
const usuariosMock = [
    { id: 1, nome: "Administrador", login: "admin", senha: "123", email: "admin@techstore.com" },
    { id: 2, nome: "Andrew Kaique", login: "user", senha: "123", email: "andrew.paula@techstore.com" }
];

/* ==========================================================================
   2. SISTEMA DE TOASTS E FEEDBACK VISUAL
   ========================================================================== */

/**
 * Exibe uma notificação temporária e moderna no canto inferior direito da tela.
 * @param {string} mensagem - Texto a ser exibido.
 * @param {string} iconeClass - Classe do Bootstrap Icons (ex. 'bi-check-circle-fill text-success').
 */
function mostrarToast(mensagem, iconeClass = 'bi-info-circle text-primary') {
    let container = document.getElementById('toast-container-global');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-global';
        container.className = 'toast-container-custom';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.innerHTML = `
        <i class="bi ${iconeClass} fs-5"></i>
        <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    // Fade out e remoção após 3 segundos
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

/* ==========================================================================
   3. MÓDULO DE AUTENTICAÇÃO INTEGRADO (SESSION STORAGE)
   ========================================================================== */

/**
 * Valida as credenciais fornecidas contra o Mock de Usuários e armazena na sessão.
 * @param {string} login - Nome de usuário informado.
 * @param {string} senha - Senha informada.
 * @returns {boolean} Status de sucesso ou falha no login.
 */
function loginUser(login, senha) {
    const usuarioValidado = usuariosMock.find(u => u.login === login && u.senha === senha);
    if (usuarioValidado) {
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioValidado));
        return true;
    }
    return false;
}

/**
 * Destrói os dados do usuário da sessão corrente e recarrega a página de vitrine.
 */
function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    mostrarToast("Desconectado da conta.", "bi-box-arrow-left text-warning");
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Recupera as informações do usuário logado na sessão ativa.
 * @returns {Object|null}
 */
function getUsuarioCorrente() {
    const sessionToken = sessionStorage.getItem('usuarioCorrente');
    return sessionToken ? JSON.parse(sessionToken) : null;
}

/**
 * Renderiza dinamicamente os controles de autenticação, favoritos e carrinho na Navbar.
 */
function renderizarAuthArea() {
    const authContainer = document.getElementById('user-auth-area');
    if (!authContainer) return;

    const usuarioLogado = getUsuarioCorrente();
    const totalFavoritos = getFavoritos().length;
    const totalCarrinho = getCarrinhoQuantidade();

    if (usuarioLogado) {
        authContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <!-- Carrinho (Link Real com Badge Reativo) -->
                <a href="carrinho.html" class="btn btn-outline-custom d-flex align-items-center gap-1.5 py-1 px-2.5 rounded-pill border-0 position-relative me-1" title="Ver Carrinho">
                    <i class="bi bi-bag-fill fs-5 text-secondary"></i>
                    ${totalCarrinho > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style="font-size: 0.7rem;">${totalCarrinho}</span>` : ''}
                </a>
                <!-- Favoritos Link com Badge -->
                <a href="favoritos.html" class="btn btn-outline-custom d-flex align-items-center gap-1.5 py-1 px-2.5 rounded-pill border-0 me-2" title="Meus Favoritos">
                    <i class="bi bi-heart-fill fs-5 text-danger"></i>
                    ${totalFavoritos > 0 ? `<span class="badge bg-secondary-subtle text-secondary rounded-pill fw-bold" style="font-size: 0.8rem;">${totalFavoritos}</span>` : ''}
                </a>
                <!-- Nome do Usuário + Sair -->
                <span class="text-dark small fw-semibold d-none d-md-inline me-2">
                    <i class="bi bi-person-circle text-primary me-1"></i> ${usuarioLogado.nome}
                </span>
                <button onclick="logoutUser()" class="btn btn-sm btn-outline-custom rounded-pill fw-bold py-1.5 px-3">Sair</button>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="login.html" class="btn btn-sm btn-primary-custom rounded-pill fw-bold px-4 py-2">
                <i class="bi bi-person-lock me-1"></i> Entrar
            </a>
        `;
    }
}

/* ==========================================================================
   4. MÓDULO DE FAVORITOS (LOCAL STORAGE POR USUÁRIO)
   ========================================================================== */

/**
 * Retorna os IDs dos produtos favoritos pertencentes ao usuário ativo.
 * @returns {number[]} Array de IDs favoritados.
 */
function getFavoritos() {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) return [];
    const storageKey = `favoritos_${usuarioLogado.id}`;
    const localData = localStorage.getItem(storageKey);
    return localData ? JSON.parse(localData) : [];
}

/**
 * Alterna a marcação de favorito do produto, validando se o usuário está logado.
 * @param {number} produtoId - ID do produto.
 */
function toggleFavorito(produtoId) {
    const usuarioLogado = getUsuarioCorrente();

    if (!usuarioLogado) {
        mostrarToast("Acesso bloqueado! Faça login para favoritar produtos.", "bi-lock-fill text-danger");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const storageKey = `favoritos_${usuarioLogado.id}`;
    let favoritos = getFavoritos();
    const index = favoritos.indexOf(produtoId);
    let adicionou = false;

    if (index > -1) {
        favoritos.splice(index, 1);
        mostrarToast("Produto removido dos favoritos.", "bi-heartbreak-fill text-muted");
    } else {
        favoritos.push(produtoId);
        mostrarToast("Produto adicionado aos favoritos!", "bi-heart-fill text-danger");
        adicionou = true;
    }

    localStorage.setItem(storageKey, JSON.stringify(favoritos));
    
    // Atualização reativa de elementos da UI sem reload de página
    renderizarAuthArea();
    
    // 1. Atualizar botões flutuantes na Vitrine Principal
    const floatingBtn = document.querySelector(`.btn-fav-floating[data-id="${produtoId}"]`);
    if (floatingBtn) {
        if (adicionou) {
            floatingBtn.classList.add('active');
            floatingBtn.innerHTML = `<i class="bi bi-heart-fill fs-5 text-danger"></i>`;
        } else {
            floatingBtn.classList.remove('active');
            floatingBtn.innerHTML = `<i class="bi bi-heart fs-5"></i>`;
        }
    }

    // 2. Atualizar botão de favorito da página de detalhes
    const detailsBtn = document.getElementById('details-fav-btn');
    if (detailsBtn) {
        if (adicionou) {
            detailsBtn.className = "btn btn-danger btn-lg px-4 fs-6 fw-bold";
            detailsBtn.innerHTML = `<i class="bi bi-heart-fill me-2"></i>Remover dos Favoritos`;
        } else {
            detailsBtn.className = "btn btn-outline-danger btn-lg px-4 fs-6 fw-bold";
            detailsBtn.innerHTML = `<i class="bi bi-heart me-2"></i>Adicionar aos Favoritos`;
        }
    }

    // 3. Recarregar grid na página de favoritos, se o usuário estiver nela
    if (document.getElementById('container-favoritos')) {
        carregarPaginaFavoritos();
    }
}

/* ==========================================================================
   5. MÓDULO DE CARRINHO DE COMPRAS INTEGRADO (ITEMIZADO NO LOCALSTORAGE)
   ========================================================================== */

/**
 * Retorna os itens do carrinho estruturados [{id: number, quantidade: number}].
 * @returns {Array<Object>}
 */
function getCarrinho() {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) return [];
    const storageKey = `carrinho_${usuarioLogado.id}`;
    const localData = localStorage.getItem(storageKey);
    
    if (!localData) return [];
    
    try {
        const parsed = JSON.parse(localData);
        // Se for o formato antigo (apenas um número), reconverte para array vazio
        if (typeof parsed === 'number') {
            return [];
        }
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

/**
 * Retorna a quantidade total acumulada de itens no carrinho.
 * @returns {number}
 */
function getCarrinhoQuantidade() {
    const carrinho = getCarrinho();
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

/**
 * Adiciona um produto ao carrinho ou incrementa sua quantidade.
 * @param {number} [produtoId] - ID do produto. Se omitido, busca da QueryString de detalhes.
 */
function adicionarAoCarrinho(produtoId) {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) {
        mostrarToast("Acesso bloqueado! Faça login para comprar.", "bi-lock-fill text-danger");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Se o ID for omitido, tenta pegar o parâmetro ID da URL (caso da página de detalhes)
    if (produtoId === undefined) {
        const urlParams = new URLSearchParams(window.location.search);
        produtoId = parseInt(urlParams.get('id'));
    }

    if (!produtoId || isNaN(produtoId)) {
        mostrarToast("Erro ao processar o produto.", "bi-exclamation-circle-fill text-danger");
        return;
    }

    const produtoExiste = data.produtos.find(p => p.id === produtoId);
    if (!produtoExiste) {
        mostrarToast("Produto inválido ou esgotado.", "bi-exclamation-circle-fill text-danger");
        return;
    }

    const storageKey = `carrinho_${usuarioLogado.id}`;
    let carrinho = getCarrinho();
    const itemExistente = carrinho.find(item => item.id === produtoId);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id: produtoId, quantidade: 1 });
    }

    localStorage.setItem(storageKey, JSON.stringify(carrinho));
    renderizarAuthArea();
    mostrarToast(`"${produtoExiste.nome}" adicionado ao carrinho!`, "bi-cart-check-fill text-success");
}

/**
 * Remove um item inteiramente do carrinho.
 * @param {number} produtoId - ID do produto.
 */
function removerDoCarrinho(produtoId) {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) return;

    const storageKey = `carrinho_${usuarioLogado.id}`;
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(item => item.id !== produtoId);

    localStorage.setItem(storageKey, JSON.stringify(carrinho));
    renderizarAuthArea();
    
    // Se estiver na página do carrinho, recarrega a visualização
    if (document.getElementById('carrinho-items-container')) {
        carregarPaginaCarrinho();
    }
    mostrarToast("Item removido do carrinho.", "bi-trash-fill text-secondary");
}

/**
 * Atualiza a quantidade específica de um item no carrinho.
 * @param {number} produtoId - ID do produto.
 * @param {number} novaQuantidade - Nova quantidade desejada.
 */
function atualizarQuantidadeCarrinho(produtoId, novaQuantidade) {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) return;

    if (novaQuantidade <= 0) {
        removerDoCarrinho(produtoId);
        return;
    }

    const storageKey = `carrinho_${usuarioLogado.id}`;
    let carrinho = getCarrinho();
    const item = carrinho.find(item => item.id === produtoId);

    if (item) {
        item.quantidade = parseInt(novaQuantidade);
        localStorage.setItem(storageKey, JSON.stringify(carrinho));
        renderizarAuthArea();
        if (document.getElementById('carrinho-items-container')) {
            carregarPaginaCarrinho();
        }
    }
}

/**
 * Simula a finalização da compra, esvaziando o carrinho.
 */
function finalizarCompra() {
    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) return;

    const carrinho = getCarrinho();
    if (carrinho.length === 0) {
        mostrarToast("Seu carrinho está vazio para fechar compra.", "bi-exclamation-circle text-warning");
        return;
    }

    // Limpa a chave do carrinho
    localStorage.removeItem(`carrinho_${usuarioLogado.id}`);
    renderizarAuthArea();

    // Mostra modal de sucesso (Bootstrap Modal ou Alerta Dinâmico)
    const modalSucesso = new bootstrap.Modal(document.getElementById('checkoutSuccessModal'));
    modalSucesso.show();
}

/**
 * Preenche a estrutura HTML da página carrinho.html
 */
function carregarPaginaCarrinho() {
    const itemsContainer = document.getElementById('carrinho-items-container');
    const resumoContainer = document.getElementById('carrinho-resumo-container');
    if (!itemsContainer || !resumoContainer) return;

    const usuarioLogado = getUsuarioCorrente();
    const carrinho = getCarrinho();

    // Se visitante
    if (!usuarioLogado) {
        itemsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-shield-lock text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold">Acesso restrito ao Carrinho</h5>
                <p class="text-muted mb-4 small">Você precisa acessar uma conta autorizada para gerenciar o carrinho.</p>
                <a href="login.html" class="btn btn-primary-custom px-4 py-2"><i class="bi bi-person-lock me-1"></i> Ir para Login</a>
            </div>
        `;
        resumoContainer.innerHTML = `
            <div class="alert alert-secondary small text-center mb-0">Faça o login para obter taxas de frete personalizadas.</div>
        `;
        return;
    }

    // Se carrinho vazio
    if (carrinho.length === 0) {
        itemsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-secondary">Seu carrinho está vazio</h5>
                <p class="text-muted mb-4 small">Adicione produtos na vitrine para visualizá-los aqui.</p>
                <a href="index.html" class="btn btn-primary-custom px-4 py-2"><i class="bi bi-bag-plus me-1"></i> Ir para Vitrine</a>
            </div>
        `;
        resumoContainer.innerHTML = `
            <div class="text-center p-3 text-muted small border rounded-3 bg-white">Sem itens no carrinho para calcular taxas.</div>
        `;
        return;
    }

    // Renderiza lista de itens
    let itemsHTML = "";
    let subtotal = 0;

    carrinho.forEach(item => {
        const produto = data.produtos.find(p => p.id === item.id);
        if (!produto) return;

        const totalItem = produto.preco * item.quantidade;
        subtotal += totalItem;

        itemsHTML += `
            <div class="cart-item-card">
                <div class="row align-items-center g-3">
                    <!-- Thumbnail -->
                    <div class="col-3 col-md-2 text-center">
                        <img src="${produto.imagem}" class="img-fluid cart-item-img" alt="${produto.nome}">
                    </div>
                    
                    <!-- Informações do Produto -->
                    <div class="col-9 col-md-4">
                        <span class="badge-category mb-1" style="font-size: 0.65rem;">${produto.categoria}</span>
                        <h6 class="fw-bold mb-1 text-dark text-truncate">${produto.nome}</h6>
                        <span class="text-primary fw-bold small">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <!-- Seleção de Quantidade -->
                    <div class="col-6 col-md-3">
                        <div class="input-group input-group-sm cart-qty-selector">
                            <button class="btn btn-light" type="button" onclick="atualizarQuantidadeCarrinho(${produto.id}, ${item.quantidade - 1})">-</button>
                            <input type="text" class="form-control cart-qty-input" value="${item.quantidade}" readonly>
                            <button class="btn btn-light" type="button" onclick="atualizarQuantidadeCarrinho(${produto.id}, ${item.quantidade + 1})">+</button>
                        </div>
                    </div>

                    <!-- Valor Acumulado & Lixeira -->
                    <div class="col-6 col-md-3 d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-dark fs-6">R$ ${totalItem.toFixed(2).replace('.', ',')}</span>
                        <button onclick="removerDoCarrinho(${produto.id})" class="cart-remove-btn" title="Remover item">
                            <i class="bi bi-trash fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    itemsContainer.innerHTML = itemsHTML;

    // Renderiza resumo de valores
    const frete = subtotal > 1000 ? 0 : 25; // frete grátis acima de R$ 1000
    const totalGeral = subtotal + frete;

    resumoContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 class="fw-bold text-dark mb-4 border-bottom pb-2">Resumo do Pedido</h5>
            <div class="d-flex justify-content-between mb-3 text-secondary">
                <span>Subtotal</span>
                <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 text-secondary">
                <span>Frete</span>
                <span>${frete === 0 ? '<span class="text-success fw-bold">Grátis</span>' : `R$ ${frete.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div class="border-top pt-3 mb-4 d-flex justify-content-between fw-bold text-dark fs-5">
                <span>Total</span>
                <span class="text-primary">R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onclick="finalizarCompra()" class="btn btn-primary-custom w-100 py-2.5 fs-6 mb-3">
                <i class="bi bi-credit-card-2-front me-2"></i>Finalizar Compra
            </button>
            <div class="text-center">
                <span class="text-muted small"><i class="bi bi-shield-lock me-1"></i> Transação 100% Segura</span>
            </div>
        </div>
    `;
}

/* ==========================================================================
   6. RENDERIZAÇÃO DA VITRINE PRINCIPAL (INDEX.HTML)
   ========================================================================== */

/**
 * Renderiza a vitrine de produtos e destaques. Suporta filtragem por string de busca.
 * @param {string} [searchQuery=""] - Termo de busca opcional para busca em tempo real.
 */
function carregarPaginaPrincipal(searchQuery = "") {
    // 1. Renderização Dinâmica do Carrossel de Destaques
    const carouselInner = document.getElementById('carousel-inner-container');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const produtosEmDestaque = data.produtos.filter(p => p.destaque);

    if (carouselInner && produtosEmDestaque.length > 0 && searchQuery === "") {
        let innerHTML = "";
        let indicatorsHTML = "";

        produtosEmDestaque.forEach((produto, index) => {
            const stateClass = index === 0 ? "active" : "";

            if (carouselIndicators) {
                indicatorsHTML += `
                    <button type="button" data-bs-target="#carouselDestaques" data-bs-slide-to="${index}" class="${stateClass}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>
                `;
            }

            innerHTML += `
                <div class="carousel-item ${stateClass}">
                    <img src="${produto.imagem}" class="d-block w-100" alt="${produto.nome}">
                    <div class="carousel-caption">
                        <span class="badge-category mb-2">${produto.categoria}</span>
                        <h4 class="fw-bold fs-3 text-white mb-2">${produto.nome}</h4>
                        <p class="text-white-50 d-none d-md-block fs-6 mb-3">${produto.conteudo}</p>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="detalhes.html?id=${produto.id}" class="btn btn-primary-custom px-4">Ver Detalhes</a>
                            <button onclick="adicionarAoCarrinho(${produto.id})" class="btn btn-outline-light border-2 px-4 rounded-3"><i class="bi bi-cart me-2"></i>Comprar</button>
                        </div>
                    </div>
                </div>
            `;
        });

        carouselInner.innerHTML = innerHTML;
        if (carouselIndicators) carouselIndicators.innerHTML = indicatorsHTML;
    }

    // 2. Renderização da Grid Geral de Cards
    const productGrid = document.getElementById('product-list');
    if (!productGrid) return;

    const favoritos = getFavoritos();
    let gridHTML = "";

    // Filtra produtos se houver string de busca
    const query = searchQuery.toLowerCase().trim();
    const produtosFiltrados = data.produtos.filter(produto => {
        return produto.nome.toLowerCase().includes(query) || 
               produto.categoria.toLowerCase().includes(query) || 
               produto.descricao.toLowerCase().includes(query);
    });

    if (produtosFiltrados.length === 0) {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search-heart text-muted fs-1 mb-3 d-block"></i>
                <p class="text-muted fs-5 mb-0">Nenhum produto foi localizado com o termo de busca informado.</p>
            </div>
        `;
        return;
    }

    produtosFiltrados.forEach(produto => {
        const itemFavoritado = favoritos.includes(produto.id);
        const iconeCoracao = itemFavoritado ? "bi-heart-fill text-danger" : "bi-heart";
        const ativoClass = itemFavoritado ? "active" : "";

        gridHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card custom-card h-100 position-relative shadow-sm d-flex flex-column">
                    <!-- Botão de Favoritar Flutuante -->
                    <button onclick="toggleFavorito(${produto.id})" data-id="${produto.id}" class="btn-fav-floating ${ativoClass}">
                        <i class="bi ${iconeCoracao} fs-5"></i>
                    </button>
                    <!-- Imagem do Produto -->
                    <div class="card-img-container" style="height: 180px;">
                        <img src="${produto.imagem}" class="img-fluid object-fit-contain" style="max-height: 140px;" alt="${produto.nome}">
                    </div>
                    <!-- Corpo do Card -->
                    <div class="card-body d-flex flex-column text-center bg-white p-3">
                        <span class="badge-category mb-2 align-self-center">${produto.categoria}</span>
                        <h5 class="card-title fs-6 fw-bold text-dark text-truncate mb-2" title="${produto.nome}">${produto.nome}</h5>
                        <p class="text-muted small text-truncate mb-3">${produto.descricao}</p>
                        <p class="text-primary fw-bold mb-3 fs-5 mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <div class="d-grid gap-2">
                            <a href="detalhes.html?id=${produto.id}" class="btn btn-outline-custom btn-sm fw-semibold">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    productGrid.innerHTML = gridHTML;
}

/* ==========================================================================
   7. PÁGINA DE DETALHES DO PRODUTO (DETALHES.HTML)
   ========================================================================== */

/**
 * Processa a Query String ID, carrega o produto e preenche a página de detalhes.
 */
function carregarPaginaDetalhes() {
    const containerDetalhes = document.getElementById('detalhes-container');
    if (!containerDetalhes) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParametro = parseInt(urlParams.get('id'));
    const produto = data.produtos.find(p => p.id === idParametro);

    if (!produto) {
        containerDetalhes.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-octagon-fill text-danger fs-1 mb-3 d-block"></i>
                <h4 class="fw-bold">Produto não localizado</h4>
                <p class="text-muted">O produto buscado não faz parte do catálogo da loja.</p>
                <a href="index.html" class="btn btn-primary-custom mt-3">Voltar para a Vitrine</a>
            </div>
        `;
        return;
    }

    // Configura breadcrumb
    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    if (breadcrumbName) breadcrumbName.innerText = produto.nome;

    const favoritos = getFavoritos();
    const itemFavoritado = favoritos.includes(produto.id);
    const textoBotaoFavorito = itemFavoritado ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
    const classeBotaoFavorito = itemFavoritado ? "btn-danger" : "btn-outline-danger";
    const iconeFavorito = itemFavoritado ? "bi-heart-fill" : "bi-heart";

    // Layout principal com estrutura moderna de galeria interativa e specs
    containerDetalhes.innerHTML = `
        <div class="row g-4 g-lg-5">
            <!-- Coluna de Imagens (Galeria Interativa) -->
            <div class="col-md-6 text-center">
                <div class="detail-main-img-container mb-3">
                    <img id="main-product-image" src="${produto.imagem}" class="img-fluid object-fit-contain" style="max-height: 320px;" alt="${produto.nome}">
                </div>
                <div class="row g-2 justify-content-center" id="gallery-thumbnails">
                    <!-- Miniaturas das fotos vinculadas injetadas via JS abaixo -->
                </div>
            </div>
            
            <!-- Coluna de Especificações -->
            <div class="col-md-6 d-flex flex-column justify-content-center">
                <span class="badge-category mb-3 align-self-start">${produto.categoria}</span>
                <h2 class="fw-bold text-dark mb-2">${produto.nome}</h2>
                <div class="d-flex align-items-center gap-2 mb-3 text-warning">
                    <div class="fs-6">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-half"></i>
                    </div>
                    <span class="text-muted small">(4.5 / 5 - 28 avaliações)</span>
                </div>
                <p class="text-muted mb-4 fs-6 leading-relaxed">${produto.conteudo}</p>
                <h3 class="text-primary fw-bold mb-4 display-6">R$ ${produto.preco.toFixed(2).replace('.', ',')}</h3>
                
                <!-- Tabela Técnica Limpa -->
                <div class="mb-4 bg-light p-3 rounded-3 border">
                    <div class="row g-2 small text-secondary">
                        <div class="col-6"><strong>Código SKU:</strong> TS-${String(produto.id).padStart(4, '0')}</div>
                        <div class="col-6"><strong>Disponibilidade:</strong> ${produto.emEstoque ? '<span class="text-success"><i class="bi bi-check2-circle"></i> Em estoque</span>' : '<span class="text-danger"><i class="bi bi-x-circle"></i> Esgotado</span>'}</div>
                        <div class="col-12 mt-2 border-top pt-2"><strong>Diferencial:</strong> ${produto.descricao}</div>
                    </div>
                </div>

                <!-- Ações CTA -->
                <div class="d-flex flex-wrap gap-3 mt-2">
                    <button onclick="adicionarAoCarrinho(${produto.id})" class="btn btn-primary-custom btn-lg flex-grow-1 flex-md-grow-0 px-4 fs-6 fw-bold shadow-sm">
                        <i class="bi bi-cart-plus me-2"></i>Adicionar ao Carrinho
                    </button>
                    <button id="details-fav-btn" onclick="toggleFavorito(${produto.id})" class="btn ${classeBotaoFavorito} btn-lg px-4 fs-6 fw-bold">
                        <i class="bi ${iconeFavorito} me-2"></i>${textoBotaoFavorito}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Carrega miniaturas e ativa lógica de troca de foto principal
    const galleryContainer = document.getElementById('gallery-thumbnails');
    if (galleryContainer && produto.fotos_vinculadas && produto.fotos_vinculadas.length > 0) {
        let galleryHTML = "";
        produto.fotos_vinculadas.forEach((foto, idx) => {
            const activeClass = idx === 0 ? "active" : "";
            galleryHTML += `
                <div class="col-auto">
                    <img src="${foto.imagem}" class="detail-thumb ${activeClass}" alt="${foto.nome}" onclick="atualizarFotoPrincipal(this, '${foto.imagem}')" title="${foto.nome}">
                </div>
            `;
        });
        galleryContainer.innerHTML = galleryHTML;
    }

    // Carrega seção de produtos relacionados
    carregarProdutosRelacionados(produto);
}

/**
 * Atualiza dinamicamente a foto em exibição no detalhe do produto.
 * @param {HTMLImageElement} thumbElement - Referência do thumbnail clicado.
 * @param {string} src - Endereço da imagem de destino.
 */
function atualizarFotoPrincipal(thumbElement, src) {
    const mainImage = document.getElementById('main-product-image');
    if (!mainImage) return;

    // Efeito suave de fade
    mainImage.style.opacity = '0.3';
    setTimeout(() => {
        mainImage.src = src;
        mainImage.style.opacity = '1';
    }, 150);

    // Atualiza classe ativa dos thumbnails
    document.querySelectorAll('.detail-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbElement.classList.add('active');
}

/**
 * Renderiza uma vitrine com produtos da mesma categoria na página de detalhes.
 * @param {Object} produtoCorrente - Produto em foco na página.
 */
function carregarProdutosRelacionados(produtoCorrente) {
    const container = document.getElementById('produtos-relacionados-container');
    if (!container) return;

    const relacionados = data.produtos.filter(p => p.categoria === produtoCorrente.categoria && p.id !== produtoCorrente.id);
    
    if (relacionados.length === 0) {
        container.innerHTML = `
            <div class="col-12 py-3">
                <p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i> Não há outros produtos relacionados na categoria <strong>${produtoCorrente.categoria}</strong> no momento.</p>
            </div>
        `;
        return;
    }

    let listHTML = "";
    relacionados.forEach(produto => {
        listHTML += `
            <div class="col-6 col-md-3">
                <div class="card custom-card h-100 shadow-sm text-center">
                    <div class="card-img-container p-3" style="height: 130px; background-color: #fafbfc;">
                        <img src="${produto.imagem}" class="img-fluid object-fit-contain" style="max-height: 100px;" alt="${produto.nome}">
                    </div>
                    <div class="card-body p-3 d-flex flex-column">
                        <h6 class="fw-bold text-dark text-truncate mb-1" title="${produto.nome}">${produto.nome}</h6>
                        <p class="text-primary fw-bold small mb-2">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <a href="detalhes.html?id=${produto.id}" class="btn btn-outline-custom btn-sm py-1 px-2.5 mt-auto fw-semibold" style="font-size: 0.8rem;">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = listHTML;
}

/* ==========================================================================
   8. PÁGINA DE FAVORITOS (FAVORITOS.HTML)
   ========================================================================== */

/**
 * Popula a página de favoritos com a lista filtrada de produtos favoritados.
 */
function carregarPaginaFavoritos() {
    const containerFavoritos = document.getElementById('container-favoritos');
    if (!containerFavoritos) return;

    const usuarioLogado = getUsuarioCorrente();
    const anonimoAlert = document.getElementById('anonimo-alert');

    // Se o usuário não estiver conectado
    if (!usuarioLogado) {
        if (anonimoAlert) anonimoAlert.classList.remove('d-none');
        containerFavoritos.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-shield-lock text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-secondary">Acesso restrito</h5>
                <p class="text-muted mb-4 small">Faça login para gerenciar sua lista de produtos favoritos.</p>
                <a href="login.html" class="btn btn-primary-custom px-4 py-2"><i class="bi bi-person-lock me-1"></i> Ir para Login</a>
            </div>
        `;
        return;
    }

    if (anonimoAlert) anonimoAlert.classList.add('d-none');

    const listaIdsFavoritos = getFavoritos();
    const produtosFavoritos = data.produtos.filter(p => listaIdsFavoritos.includes(p.id));

    // Se a lista estiver vazia
    if (produtosFavoritos.length === 0) {
        containerFavoritos.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-heartbreak text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-secondary">Sua lista está vazia</h5>
                <p class="text-muted mb-4 small">Nenhum produto foi marcado como favorito ainda.</p>
                <a href="index.html" class="btn btn-primary-custom px-4 py-2"><i class="bi bi-bag-plus me-1"></i> Ir para Vitrine</a>
            </div>
        `;
        return;
    }

    let favoritosHTML = "";
    produtosFavoritos.forEach(produto => {
        favoritosHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card custom-card h-100 position-relative shadow-sm d-flex flex-column">
                    <!-- Botão de Remover Favorito -->
                    <button onclick="toggleFavorito(${produto.id})" class="btn-fav-floating active">
                        <i class="bi bi-heart-fill fs-5 text-danger"></i>
                    </button>
                    <!-- Imagem -->
                    <div class="card-img-container" style="height: 180px;">
                        <img src="${produto.imagem}" class="img-fluid object-fit-contain" style="max-height: 140px;" alt="${produto.nome}">
                    </div>
                    <!-- Corpo -->
                    <div class="card-body d-flex flex-column text-center bg-white p-3">
                        <span class="badge-category mb-2 align-self-center">${produto.categoria}</span>
                        <h5 class="card-title fs-6 fw-bold text-dark text-truncate mb-2" title="${produto.nome}">${produto.nome}</h5>
                        <p class="text-primary fw-bold mb-3 fs-5 mt-auto">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <div class="d-grid gap-2">
                            <a href="detalhes.html?id=${produto.id}" class="btn btn-outline-custom btn-sm fw-semibold">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    containerFavoritos.innerHTML = favoritosHTML;
}

/* ==========================================================================
   9. PAINEL DE ESTATÍSTICAS E GRÁFICOS (ESTATISTICAS.HTML)
   ========================================================================== */

/**
 * Processa as chaves do catálogo, computa KPIs de negócios e renderiza gráficos Chart.js.
 */
function configurarGraficoCategorias() {
    // 1. Populando KPIs de Negócios na interface
    const kpiTotalProdutos = document.getElementById('kpi-total-produtos');
    const kpiPrecoMedio = document.getElementById('kpi-preco-medio');
    const kpiItemPremium = document.getElementById('kpi-item-premium');
    const kpiTotalCategorias = document.getElementById('kpi-total-categorias');

    if (kpiTotalProdutos) {
        const total = data.produtos.length;
        kpiTotalProdutos.innerText = total;

        const precoMedioVal = data.produtos.reduce((acc, p) => acc + p.preco, 0) / total;
        kpiPrecoMedio.innerText = `R$ ${precoMedioVal.toFixed(2).replace('.', ',')}`;

        // Identifica item mais caro
        const maisCaro = data.produtos.reduce((max, p) => p.preco > max.preco ? p : max, data.produtos[0]);
        kpiItemPremium.innerText = maisCaro.nome;
        kpiItemPremium.title = `${maisCaro.nome} - R$ ${maisCaro.preco.toFixed(2).replace('.', ',')}`;

        // Conta categorias distintas
        const categoriasUnicas = [...new Set(data.produtos.map(p => p.categoria))];
        kpiTotalCategorias.innerText = categoriasUnicas.length;
    }

    // 2. Gráfico 1: Distribuição de Produtos por Categoria (Pizza)
    const canvasPizza = document.getElementById('graficoCategorias');
    if (!canvasPizza) return;

    const contagemCategorias = data.produtos.reduce((acumulador, produto) => {
        acumulador[produto.categoria] = (acumulador[produto.categoria] || 0) + 1;
        return acumulador;
    }, {});

    const categoriasLabels = Object.keys(contagemCategorias);
    const quantidadesValores = Object.values(contagemCategorias);

    new Chart(canvasPizza, {
        type: 'doughnut',
        data: {
            labels: categoriasLabels,
            datasets: [{
                label: 'Itens no Catálogo',
                data: quantidadesValores,
                backgroundColor: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { family: 'Inter', weight: 'bold', size: 11 }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // 3. Gráfico 2: Valor Total em Estoque por Categoria (Barras)
    const canvasBarras = document.getElementById('graficoPrecosPorCategoria');
    if (!canvasBarras) return;

    // Calcula soma dos preços das categorias
    const valoresCategorias = data.produtos.reduce((acumulador, produto) => {
        acumulador[produto.categoria] = (acumulador[produto.categoria] || 0) + produto.preco;
        return acumulador;
    }, {});

    const valoresArray = categoriasLabels.map(cat => valoresCategorias[cat]);

    new Chart(canvasBarras, {
        type: 'bar',
        data: {
            labels: categoriasLabels,
            datasets: [{
                label: 'Valor Total (R$)',
                data: valoresArray,
                backgroundColor: ['rgba(79, 70, 229, 0.85)', 'rgba(124, 58, 237, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0.85)', 'rgba(239, 68, 68, 0.85)'],
                borderColor: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value;
                        },
                        font: { family: 'Inter', size: 10 }
                    }
                },
                x: {
                    ticks: { font: { family: 'Inter', size: 10 } }
                }
            }
        }
    });
}

/* ==========================================================================
   10. MENU LATERAL DE NAVEGAÇÃO E OFFCANVAS
   ========================================================================== */

/**
 * Renderiza dinamicamente e centraliza a árvore HTML da sidebar offcanvas.
 */
function carregarMenuLateral() {
    const offcanvasPlaceholder = document.getElementById('menuLateralTechStore');
    if (!offcanvasPlaceholder) return;

    // Identifica o arquivo atual na URL para marcar estado ativo na navegação
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    let subMenuProdutosHTML = "";
    data.produtos.forEach(produto => {
        subMenuProdutosHTML += `
            <li>
                <a class="nav-link custom-sublink" href="detalhes.html?id=${produto.id}">
                    <i class="bi bi-chevron-right fs-9 me-1"></i>${produto.nome}
                </a>
            </li>
        `;
    });

    const isHomeActive = currentPath === 'index.html' || currentPath === '' ? 'active' : '';
    const isCartActive = currentPath === 'carrinho.html' ? 'active' : '';
    const isFavActive = currentPath === 'favoritos.html' ? 'active' : '';
    const isEstActive = currentPath === 'estatisticas.html' ? 'active' : '';

    offcanvasPlaceholder.innerHTML = `
        <div class="offcanvas-header border-bottom border-secondary px-4 py-3">
            <h5 class="offcanvas-title fw-bold text-white" id="menuLateralTechStoreLabel">
                <i class="bi bi-layers-half text-primary me-2"></i>TechStore Painel
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0 pt-4">
            <div class="d-grid gap-2 px-3">
                
                <!-- Links Principais -->
                <a href="index.html" class="nav-link d-flex align-items-center gap-3 py-2.5 ${isHomeActive}">
                    <i class="bi bi-house-door"></i> Vitrine Principal
                </a>

                <a href="carrinho.html" class="nav-link d-flex align-items-center gap-3 py-2.5 ${isCartActive}">
                    <i class="bi bi-bag"></i> Carrinho de Compras
                </a>
                
                <a href="favoritos.html" class="nav-link d-flex align-items-center gap-3 py-2.5 ${isFavActive}">
                    <i class="bi bi-heart"></i> Meus Favoritos
                </a>
                
                <a href="estatisticas.html" class="nav-link d-flex align-items-center gap-3 py-2.5 ${isEstActive}">
                    <i class="bi bi-graph-up"></i> Estatísticas da Loja
                </a>
                
                <!-- Collapse de Páginas de Produtos -->
                <div class="border-top border-secondary pt-3 mt-2">
                    <button class="btn btn-dark text-start d-flex justify-content-between align-items-center w-100 p-2.5 rounded-3 border-0 bg-white bg-opacity-5" type="button" data-bs-toggle="collapse" data-bs-target="#submenuVitrine" aria-expanded="true" aria-controls="submenuVitrine">
                        <span class="text-white-50"><i class="bi bi-box-seam me-2 text-primary"></i> Detalhes do Produto</span>
                        <i class="bi bi-chevron-down text-white-50" style="font-size: 0.8rem;"></i>
                    </button>
                    
                    <div class="collapse show" id="submenuVitrine">
                        <ul class="list-unstyled mt-2 mb-0">
                            ${subMenuProdutosHTML}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    `;
}

/* ==========================================================================
   11. INTERCEPTADORES DO CICLO DE VIDA DA APLICAÇÃO (INITIALIZATION)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega estruturas globais da UI
    carregarMenuLateral();
    renderizarAuthArea();

    // 2. Aciona rotinas de páginas específicas com base na existência de elementos âncora no DOM
    if (document.getElementById('product-list')) {
        carregarPaginaPrincipal();
        
        // Liga o motor de busca em tempo real (Desktop e Mobile)
        const searchInput = document.getElementById('search-input');
        const searchInputMobile = document.getElementById('search-input-mobile');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                carregarPaginaPrincipal(e.target.value);
            });
        }
        if (searchInputMobile) {
            searchInputMobile.addEventListener('input', (e) => {
                carregarPaginaPrincipal(e.target.value);
                if (searchInput) searchInput.value = e.target.value; // Sincroniza inputs
            });
        }
    }
    
    if (document.getElementById('container-favoritos')) {
        carregarPaginaFavoritos();
    }
    
    if (document.getElementById('detalhes-container')) {
        carregarPaginaDetalhes();
    }
    
    if (document.getElementById('graficoCategorias')) {
        configurarGraficoCategorias();
    }

    if (document.getElementById('carrinho-items-container')) {
        carregarPaginaCarrinho();
    }
});