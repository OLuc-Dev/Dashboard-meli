import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  GraduationCap,
  LogOut,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import PrivateRoute from './components/PrivateRoute';
import logoImage from './assets/logo.png';
import './App.css';

const FALLBACK_DASHBOARD_DATA = {
  metrics: {
    total_produtos: 0,
    aguardando_envio: 0,
    tempo_medio_permanencia: 0,
    eficiencia_operacional: 0,
  },
  products: [],
};

const EMPTY_MELI_DATA = {
  metrics: {},
  products: [],
  orders: [],
  notifications: [],
  analytics: {},
};

const tabs = [
  { id: 'dashboard', label: 'Operação CD', icon: Package },
  { id: 'gestores', label: 'Gestores', icon: Users },
  { id: 'mercadolivre', label: 'Mercado Livre', icon: ShoppingBag },
];

const gestores = [
  { id: 1, nome: 'Ana Silva', departamento: 'Logística', email: 'ana.silva@meli.com', telefone: '(11) 99999-1111' },
  { id: 2, nome: 'Carlos Santos', departamento: 'Operações', email: 'carlos.santos@meli.com', telefone: '(11) 99999-2222' },
  { id: 3, nome: 'Maria Oliveira', departamento: 'Qualidade', email: 'maria.oliveira@meli.com', telefone: '(11) 99999-3333' },
  { id: 4, nome: 'João Pereira', departamento: 'Tecnologia', email: 'joao.pereira@meli.com', telefone: '(11) 99999-4444' },
  { id: 5, nome: 'Fernanda Costa', departamento: 'RH', email: 'fernanda.costa@meli.com', telefone: '(11) 99999-5555' },
];

const aprendizes = [
  { id: 1, nome: 'Lucas Aprendiz', gestorId: 1, gestor: 'Ana Silva', status: 'ativo', progresso: 85, tarefas: 12 },
  { id: 2, nome: 'Beatriz Santos', gestorId: 2, gestor: 'Carlos Santos', status: 'ativo', progresso: 92, tarefas: 15 },
  { id: 3, nome: 'Pedro Lima', gestorId: 1, gestor: 'Ana Silva', status: 'ativo', progresso: 78, tarefas: 10 },
  { id: 4, nome: 'Julia Ferreira', gestorId: 3, gestor: 'Maria Oliveira', status: 'inativo', progresso: 65, tarefas: 8 },
  { id: 5, nome: 'Rafael Souza', gestorId: 4, gestor: 'João Pereira', status: 'ativo', progresso: 88, tarefas: 14 },
];

const defaultTicketForm = {
  assunto: '',
  descricao: '',
  tipo: '',
  prioridade: '',
  gestorId: '',
};

const statusConfig = {
  em_estoque: { label: 'Em estoque', className: 'status-em-estoque' },
  enviado: { label: 'Enviado', className: 'status-enviado' },
  pendente: { label: 'Pendente', className: 'status-pendente' },
};

const normalizeText = (value) => String(value ?? '').toLowerCase().trim();
const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const numberFormatter = new Intl.NumberFormat('pt-BR');
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function getInitials(name) {
  return String(name ?? 'Produto')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

async function parseJsonResponse(response, fallback) {
  const contentType = response.headers.get('content-type') || '';
  const canParseJson = contentType.includes('application/json');

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    if (canParseJson) {
      const payload = await response.json().catch(() => ({}));
      message = payload.error || payload.message || message;
    }
    throw new Error(message);
  }

  if (!canParseJson) {
    return fallback;
  }

  return response.json();
}

function Loader({ message = 'Carregando dashboard...' }) {
  return (
    <div className="loader-screen">
      <div className="loader-card">
        <div className="loader-spinner" />
        <p>{message}</p>
      </div>
    </div>
  );
}

function TabButton({ tab, activeTab, onSelect }) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(tab.id)}
      className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
      aria-pressed={activeTab === tab.id}
    >
      <Icon size={18} />
      <span>{tab.label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = 'blue', progress }) {
  const hasProgress = typeof progress !== 'undefined';

  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <div className="stat-card__icon">
          <Icon size={24} />
        </div>
        <span className="stat-card__label">{label}</span>
      </div>
      <strong className="stat-card__value">{value}</strong>
      {hint && <span className="stat-card__hint">{hint}</span>}
      {hasProgress && (
        <div className="stat-card__progress" aria-label={`${label}: ${clampPercent(progress)}%`}>
          <span style={{ width: `${clampPercent(progress)}%` }} />
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status || 'Sem status', className: 'status-default' };
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

function ProductAvatar({ name }) {
  return (
    <div className="product-avatar" aria-hidden="true">
      <Package size={18} />
      <span>{getInitials(name)}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, variant = 'primary' }) {
  return (
    <article className="feature-card">
      <div className={`feature-card__icon feature-card__icon--${variant}`}>
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="feature-card__button">
        Acessar
        <ChevronRight size={16} />
      </button>
    </article>
  );
}

function Dashboard() {
  const { user, logout, authenticatedFetch } = useAuth();
  const [data, setData] = useState(FALLBACK_DASHBOARD_DATA);
  const [meliData, setMeliData] = useState(EMPTY_MELI_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGestorSection, setActiveGestorSection] = useState('selecionar');
  const [managerSearch, setManagerSearch] = useState('');
  const [apprenticeSearch, setApprenticeSearch] = useState('');
  const [ticketFeedback, setTicketFeedback] = useState(null);
  const [chamadoForm, setChamadoForm] = useState(defaultTicketForm);

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      const requests = [
        { key: 'cd', url: '/api/cd-data', fallback: FALLBACK_DASHBOARD_DATA },
        { key: 'metrics', url: '/api/mercadolivre/metrics', fallback: {} },
        { key: 'products', url: '/api/mercadolivre/products?limit=10', fallback: { results: [] } },
        { key: 'orders', url: '/api/mercadolivre/orders?limit=10', fallback: { results: [] } },
        { key: 'notifications', url: '/api/mercadolivre/notifications', fallback: { notifications: [] } },
        { key: 'analytics', url: '/api/mercadolivre/analytics', fallback: {} },
      ];

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const results = await Promise.allSettled(
        requests.map(async (requestConfig) => {
          const response = await authenticatedFetch(requestConfig.url);
          return parseJsonResponse(response, requestConfig.fallback);
        }),
      );

      const nextData = {};
      const failures = [];

      results.forEach((result, index) => {
        const requestConfig = requests[index];
        if (result.status === 'fulfilled') {
          nextData[requestConfig.key] = result.value;
        } else {
          failures.push(result.reason?.message || requestConfig.url);
          nextData[requestConfig.key] = requestConfig.fallback;
        }
      });

      setData(nextData.cd || FALLBACK_DASHBOARD_DATA);
      setMeliData({
        metrics: nextData.metrics || {},
        products: Array.isArray(nextData.products?.results) ? nextData.products.results : [],
        orders: Array.isArray(nextData.orders?.results) ? nextData.orders.results : [],
        notifications: Array.isArray(nextData.notifications?.notifications)
          ? nextData.notifications.notifications
          : [],
        analytics: nextData.analytics || {},
      });

      if (failures.length) {
        const uniqueFailures = [...new Set(failures)].slice(0, 2).join(' | ');
        setError(`Alguns dados não puderam ser sincronizados agora: ${uniqueFailures}`);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [authenticatedFetch],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const products = useMemo(() => (Array.isArray(data.products) ? data.products : []), [data.products]);
  const metrics = data.metrics || FALLBACK_DASHBOARD_DATA.metrics;

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.categoria).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const search = normalizeText(searchTerm);
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        normalizeText(product.nome).includes(search) ||
        normalizeText(product.sku).includes(search) ||
        normalizeText(product.categoria).includes(search);
      const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
      const matchesStatus = !selectedStatus || product.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const filteredManagers = useMemo(() => {
    const search = normalizeText(managerSearch);
    return gestores.filter((gestor) => {
      if (!search) return true;
      return [gestor.nome, gestor.departamento, gestor.email].some((field) => normalizeText(field).includes(search));
    });
  }, [managerSearch]);

  const filteredApprentices = useMemo(() => {
    const search = normalizeText(apprenticeSearch);
    return aprendizes.filter((aprendiz) => {
      if (!search) return true;
      return [aprendiz.nome, aprendiz.gestor, aprendiz.status].some((field) => normalizeText(field).includes(search));
    });
  }, [apprenticeSearch]);

  const meliMetrics = meliData.metrics || {};
  const todayMetrics = meliMetrics.today || {};
  const analytics = meliData.analytics || {};

  const handleTicketChange = (event) => {
    const { name, value } = event.target;
    setChamadoForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleTicketSubmit = (event) => {
    event.preventDefault();

    const missingRequiredFields = ['assunto', 'descricao', 'tipo', 'prioridade', 'gestorId'].some(
      (field) => !String(chamadoForm[field]).trim(),
    );

    if (missingRequiredFields) {
      setTicketFeedback({ type: 'error', message: 'Preencha todos os campos para enviar o chamado.' });
      return;
    }

    setTicketFeedback({ type: 'success', message: 'Chamado preparado com sucesso. O gestor receberá a solicitação.' });
    setChamadoForm(defaultTicketForm);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand-lockup">
            <div className="brand-logo-wrap">
              <img src={logoImage} alt="Mercado Livre" className="brand-logo" />
            </div>
            <div className="brand-copy">
              <span className="eyebrow">Operação MELI</span>
              <h1>Dashboard Empresarial</h1>
            </div>
          </div>

          <nav className="tab-nav" aria-label="Navegação principal">
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} activeTab={activeTab} onSelect={setActiveTab} />
            ))}
          </nav>

          <div className="user-menu">
            <div className="user-chip">
              <User size={18} />
              <span>{user?.nome || 'Usuário'}</span>
            </div>
            <button type="button" onClick={logout} className="logout-button" title="Sair da conta">
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="hero-card">
          <div className="hero-card__content">
            <span className="eyebrow">Visão em tempo real</span>
            <h2>Controle sua operação com clareza e velocidade.</h2>
            <p>
              Acompanhe produtos no CD, chamados de gestores e indicadores do Mercado Livre em uma experiência mais leve,
              responsiva e estável.
            </p>
            <div className="hero-badges">
              <span className="soft-badge soft-badge--success">
                <ShieldCheck size={16} /> Sistema autenticado
              </span>
              <span className="soft-badge">
                <Sparkles size={16} /> Interface refinada
              </span>
            </div>
          </div>
          <div className="hero-card__actions">
            <button type="button" className="secondary-action" onClick={() => loadData({ silent: true })} disabled={refreshing}>
              <RefreshCw className={refreshing ? 'spin' : ''} size={18} />
              {refreshing ? 'Atualizando...' : 'Atualizar dados'}
            </button>
          </div>
        </section>

        {error && (
          <div className="feedback-banner feedback-banner--warning" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <section className="section-stack" aria-label="Painel do centro de distribuição">
            <div className="kpi-grid">
              <StatCard icon={Package} label="Total de produtos" value={formatNumber(metrics.total_produtos || products.length)} hint="Itens monitorados no CD" tone="blue" />
              <StatCard icon={Truck} label="Aguardando envio" value={formatNumber(metrics.aguardando_envio)} hint="Pedidos em preparação" tone="orange" />
              <StatCard icon={Clock} label="Tempo médio" value={`${Number(metrics.tempo_medio_permanencia || 0).toFixed(1)}h`} hint="Permanência no CD" tone="purple" />
              <StatCard icon={TrendingUp} label="Eficiência" value={`${formatNumber(metrics.eficiencia_operacional)}%`} hint="Meta operacional" tone="green" progress={metrics.eficiencia_operacional} />
            </div>

            <div className="dashboard-grid">
              <div className="operations-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Cross Docking</span>
                    <h2>Produtos e filtros</h2>
                  </div>
                  <span className="filter-count">{filteredProducts.length} encontrados</span>
                </div>

                <div className="filter-grid">
                  <label className="input-with-icon">
                    <Search className="search-icon" size={18} />
                    <input
                      type="search"
                      className="control-input"
                      placeholder="Buscar produto, SKU ou categoria..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </label>

                  <label className="input-with-icon">
                    <Filter className="search-icon" size={18} />
                    <select className="control-input" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>

                  <select className="control-input" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="em_estoque">Em estoque</option>
                    <option value="enviado">Enviado</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="product-grid">
                    {filteredProducts.map((product, index) => (
                      <article key={product.id || product.sku || product.nome || index} className="product-card">
                        <div className="product-card__header">
                          <ProductAvatar name={product.nome} />
                          <div>
                            <h3 className="product-card__title">{product.nome || 'Produto sem nome'}</h3>
                            <p className="product-card__meta">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="product-card__body">
                          <div className="product-row">
                            <span>Status</span>
                            <StatusBadge status={product.status} />
                          </div>
                          <div className="product-row">
                            <span>Quantidade</span>
                            <strong>{formatNumber(product.quantidade)} un.</strong>
                          </div>
                          <div className="product-row">
                            <span>Categoria</span>
                            <strong>{product.categoria || 'Sem categoria'}</strong>
                          </div>
                          <div className="product-row">
                            <span>Tempo no CD</span>
                            <strong>{formatNumber(product.tempo_permanencia)}h</strong>
                          </div>
                        </div>

                        <button type="button" className="product-card__button">
                          Ver detalhes
                          <ChevronRight size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Package}
                    title="Nenhum produto encontrado"
                    description="Ajuste a busca ou os filtros para visualizar outros itens do CD."
                  />
                )}
              </div>

              <aside className="sidebar-panel" aria-label="Resumo operacional">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Resumo</span>
                    <h2>Saúde da operação</h2>
                  </div>
                </div>
                <div className="mini-metric">
                  <span className="mini-metric__value">{formatNumber(metrics.eficiencia_operacional)}%</span>
                  <span className="mini-metric__label">Eficiência operacional</span>
                  <div className="progress-track">
                    <span className="progress-fill progress-fill--yellow" style={{ width: `${clampPercent(metrics.eficiencia_operacional)}%` }} />
                  </div>
                </div>
                <div className="mini-metric">
                  <span className="mini-metric__value">{formatNumber(filteredProducts.length)}</span>
                  <span className="mini-metric__label">Itens visíveis após filtros</span>
                </div>
                <div className="integration-status">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Dados protegidos</strong>
                    <p>Requisições enviadas com token JWT e tratamento de sessão expirada.</p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {activeTab === 'gestores' && (
          <section className="section-stack" aria-label="Gestão de pessoas">
            <div className="section-nav">
              <button type="button" onClick={() => setActiveGestorSection('selecionar')} className={`gestor-section-button ${activeGestorSection === 'selecionar' ? 'active' : ''}`}>
                <Users size={18} />
                Selecionar gestor
              </button>
              <button type="button" onClick={() => setActiveGestorSection('chamado')} className={`gestor-section-button ${activeGestorSection === 'chamado' ? 'active' : ''}`}>
                <ClipboardList size={18} />
                Abrir chamado
              </button>
              <button type="button" onClick={() => setActiveGestorSection('aprendizes')} className={`gestor-section-button ${activeGestorSection === 'aprendizes' ? 'active' : ''}`}>
                <GraduationCap size={18} />
                Aprendizes
              </button>
            </div>

            {activeGestorSection === 'selecionar' && (
              <div className="operations-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Gestores</span>
                    <h2>Encontre o responsável ideal</h2>
                  </div>
                  <span className="filter-count">{filteredManagers.length} gestores</span>
                </div>

                <label className="input-with-icon">
                  <Search className="search-icon" size={18} />
                  <input
                    type="search"
                    className="control-input"
                    placeholder="Buscar por nome, email ou departamento..."
                    value={managerSearch}
                    onChange={(event) => setManagerSearch(event.target.value)}
                  />
                </label>

                <div className="manager-grid">
                  {filteredManagers.map((gestor) => (
                    <article key={gestor.id} className="manager-card">
                      <div className="product-card__header">
                        <div className="avatar-circle avatar-circle--blue">
                          <User size={20} />
                        </div>
                        <div>
                          <h3>{gestor.nome}</h3>
                          <p>{gestor.departamento}</p>
                        </div>
                      </div>
                      <div className="manager-card__meta">
                        <span>{gestor.email}</span>
                        <span>{gestor.telefone}</span>
                      </div>
                      <button type="button" className="manager-card__button" onClick={() => setChamadoForm((previous) => ({ ...previous, gestorId: String(gestor.id) }))}>
                        Vincular ao chamado
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeGestorSection === 'chamado' && (
              <div className="ticket-card">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Chamados</span>
                    <h2>Abra uma solicitação</h2>
                  </div>
                </div>

                {ticketFeedback && (
                  <div className={`feedback-banner feedback-banner--${ticketFeedback.type === 'success' ? 'success' : 'warning'}`}>
                    {ticketFeedback.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span>{ticketFeedback.message}</span>
                  </div>
                )}

                <form className="ticket-form" onSubmit={handleTicketSubmit}>
                  <div className="form-grid">
                    <label className="form-field">
                      Assunto
                      <input name="assunto" className="control-input" placeholder="Ex.: Divergência no pedido" value={chamadoForm.assunto} onChange={handleTicketChange} />
                    </label>
                    <label className="form-field">
                      Gestor responsável
                      <select name="gestorId" className="control-input" value={chamadoForm.gestorId} onChange={handleTicketChange}>
                        <option value="">Selecione um gestor...</option>
                        {gestores.map((gestor) => (
                          <option key={gestor.id} value={gestor.id}>{gestor.nome} - {gestor.departamento}</option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      Tipo
                      <select name="tipo" className="control-input" value={chamadoForm.tipo} onChange={handleTicketChange}>
                        <option value="">Selecione...</option>
                        <option value="problema_tecnico">Problema técnico</option>
                        <option value="solicitacao">Solicitação</option>
                        <option value="feedback">Feedback</option>
                        <option value="duvida">Dúvida</option>
                      </select>
                    </label>
                    <label className="form-field">
                      Prioridade
                      <select name="prioridade" className="control-input" value={chamadoForm.prioridade} onChange={handleTicketChange}>
                        <option value="">Selecione...</option>
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </label>
                  </div>

                  <label className="form-field">
                    Descrição detalhada
                    <textarea name="descricao" className="control-input" rows={6} placeholder="Descreva o contexto, impacto e próximos passos esperados..." value={chamadoForm.descricao} onChange={handleTicketChange} />
                  </label>

                  <div className="form-actions">
                    <button type="button" className="ghost-button" onClick={() => { setChamadoForm(defaultTicketForm); setTicketFeedback(null); }}>
                      Limpar
                    </button>
                    <button type="submit" className="primary-action">
                      Enviar chamado
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeGestorSection === 'aprendizes' && (
              <div className="operations-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Aprendizes</span>
                    <h2>Acompanhe evolução e tarefas</h2>
                  </div>
                  <span className="filter-count">{filteredApprentices.length} pessoas</span>
                </div>

                <label className="input-with-icon">
                  <Search className="search-icon" size={18} />
                  <input
                    type="search"
                    className="control-input"
                    placeholder="Buscar aprendiz, gestor ou status..."
                    value={apprenticeSearch}
                    onChange={(event) => setApprenticeSearch(event.target.value)}
                  />
                </label>

                <div className="manager-grid">
                  {filteredApprentices.map((aprendiz) => (
                    <article key={aprendiz.id} className="apprentice-card">
                      <div className="product-card__header">
                        <div className="avatar-circle avatar-circle--green">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <h3>{aprendiz.nome}</h3>
                          <p>Gestor: {aprendiz.gestor}</p>
                        </div>
                      </div>
                      <div className="product-row">
                        <span>Status</span>
                        <span className={`status-pill ${aprendiz.status === 'ativo' ? 'status-pill--success' : 'status-pill--danger'}`}>
                          {aprendiz.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="apprentice-progress">
                        <div className="product-row">
                          <span>Progresso</span>
                          <strong>{aprendiz.progresso}%</strong>
                        </div>
                        <div className="progress-track">
                          <span className="progress-fill progress-fill--yellow" style={{ width: `${clampPercent(aprendiz.progresso)}%` }} />
                        </div>
                      </div>
                      <div className="product-row">
                        <span>Tarefas concluídas</span>
                        <strong>{aprendiz.tarefas}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'mercadolivre' && (
          <section className="section-stack" aria-label="Integração Mercado Livre">
            <div className="kpi-grid">
              <StatCard icon={ShoppingBag} label="Produtos ativos" value={formatNumber(meliData.products.length)} hint="Amostra sincronizada" tone="blue" />
              <StatCard icon={TrendingUp} label="Vendas hoje" value={formatNumber(todayMetrics.sales_count)} hint="Pedidos pagos" tone="green" />
              <StatCard icon={BarChart3} label="Faturamento" value={formatCurrency(todayMetrics.revenue)} hint="Receita do dia" tone="yellow" />
              <StatCard icon={Clock} label="Pendências" value={formatNumber(todayMetrics.orders_pending)} hint="Pedidos aguardando ação" tone="orange" />
            </div>

            <div className="meli-grid">
              <div className="operations-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Ferramentas</span>
                    <h2>Central Mercado Livre</h2>
                  </div>
                </div>
                <div className="feature-grid">
                  <FeatureCard icon={Package} title="Gestão de produtos" description="Controle preços, status e estoque em uma visão única." variant="primary" />
                  <FeatureCard icon={FileText} title="Relatórios de vendas" description="Transforme pedidos em indicadores fáceis de acompanhar." variant="success" />
                  <FeatureCard icon={MessageCircle} title="Atendimento" description="Organize perguntas e mensagens dos compradores." variant="purple" />
                  <FeatureCard icon={AlertCircle} title="Alertas" description="Identifique estoque baixo e pendências críticas." variant="warning" />
                </div>
              </div>

              <aside className="notifications-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Alertas</span>
                    <h2>Notificações</h2>
                  </div>
                  <Bell size={20} />
                </div>

                {meliData.notifications.length ? (
                  <div className="notification-list">
                    {meliData.notifications.map((notification) => (
                      <article key={notification.id} className={`notification-card notification-card--${notification.priority || 'low'}`}>
                        <span className="notification-dot" />
                        <div>
                          <strong>{notification.title}</strong>
                          <p>{notification.message}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Bell} title="Tudo em dia" description="Nenhuma notificação crítica foi encontrada." />
                )}
              </aside>
            </div>

            <div className="analytics-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Analytics</span>
                  <h2>Performance dos últimos ciclos</h2>
                </div>
              </div>
              <div className="insight-grid">
                <div className="insight-card">
                  <span>Visitas totais</span>
                  <strong>{formatNumber(analytics.visits?.total)}</strong>
                </div>
                <div className="insight-card">
                  <span>Visitantes únicos</span>
                  <strong>{formatNumber(analytics.visits?.unique)}</strong>
                </div>
                <div className="insight-card">
                  <span>Conversão</span>
                  <strong>{Number(analytics.visits?.conversion_rate || 0).toFixed(1)}%</strong>
                </div>
              </div>
              <div className="integration-status">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Status da integração: conectado</strong>
                  <p>Dados simulados carregados com fallback seguro quando algum endpoint falha.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        Dashboard Empresarial Mercado Livre · atualizado para uma experiência mais fluida
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;
