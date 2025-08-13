import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Clock, TrendingUp, BarChart3, Users, FileText, GraduationCap, User, AlertCircle, LogOut } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import PrivateRoute from './components/PrivateRoute';
import logoImage from './assets/logo.png';
import './App.css';

function Dashboard() {
  const { user, logout, authenticatedFetch } = useAuth();
  const [data, setData] = useState({ products: [], metrics: {} });
  const [meliData, setMeliData] = useState({ 
    metrics: {}, 
    products: [], 
    orders: [], 
    notifications: [],
    analytics: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGestorSection, setActiveGestorSection] = useState('selecionar');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar dados do Cross Docking
        const cdResponse = await authenticatedFetch('/api/cd-data');
        const cdData = await cdResponse.json();
        setData(cdData);

        // Carregar dados do Mercado Livre
        const [metricsRes, productsRes, ordersRes, notificationsRes, analyticsRes] = await Promise.all([
          authenticatedFetch('/api/mercadolivre/metrics'),
          authenticatedFetch('/api/mercadolivre/products?limit=10'),
          authenticatedFetch('/api/mercadolivre/orders?limit=10'),
          authenticatedFetch('/api/mercadolivre/notifications'),
          authenticatedFetch('/api/mercadolivre/analytics')
        ]);

        const [metrics, products, orders, notifications, analytics] = await Promise.all([
          metricsRes.json(),
          productsRes.json(),
          ordersRes.json(),
          notificationsRes.json(),
          analyticsRes.json()
        ]);

        setMeliData({
          metrics,
          products: products.results || [],
          orders: orders.results || [],
          notifications: notifications.notifications || [],
          analytics
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [authenticatedFetch]);

  // Dados mockados para gestores
  const gestores = [
    { id: 1, nome: 'Ana Silva', departamento: 'Logística', email: 'ana.silva@meli.com', telefone: '(11) 99999-1111' },
    { id: 2, nome: 'Carlos Santos', departamento: 'Operações', email: 'carlos.santos@meli.com', telefone: '(11) 99999-2222' },
    { id: 3, nome: 'Maria Oliveira', departamento: 'Qualidade', email: 'maria.oliveira@meli.com', telefone: '(11) 99999-3333' },
    { id: 4, nome: 'João Pereira', departamento: 'Tecnologia', email: 'joao.pereira@meli.com', telefone: '(11) 99999-4444' },
    { id: 5, nome: 'Fernanda Costa', departamento: 'RH', email: 'fernanda.costa@meli.com', telefone: '(11) 99999-5555' }
  ];

  // Dados mockados para aprendizes
  const aprendizes = [
    { id: 1, nome: 'Lucas Aprendiz', gestorId: 1, gestor: 'Ana Silva', status: 'ativo', progresso: 85, tarefas: 12 },
    { id: 2, nome: 'Beatriz Santos', gestorId: 2, gestor: 'Carlos Santos', status: 'ativo', progresso: 92, tarefas: 15 },
    { id: 3, nome: 'Pedro Lima', gestorId: 1, gestor: 'Ana Silva', status: 'ativo', progresso: 78, tarefas: 10 },
    { id: 4, nome: 'Julia Ferreira', gestorId: 3, gestor: 'Maria Oliveira', status: 'inativo', progresso: 65, tarefas: 8 },
    { id: 5, nome: 'Rafael Souza', gestorId: 4, gestor: 'João Pereira', status: 'ativo', progresso: 88, tarefas: 14 }
  ];

  // Estados para formulário de chamado
  const [chamadoForm, setChamadoForm] = useState({
    assunto: '',
    descricao: '',
    tipo: '',
    prioridade: '',
    gestorId: ''
  });

  const getProductImage = (productName) => {
    const imageMap = {
      'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
      'notebook': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop',
      'câmera': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=100&h=100&fit=crop',
      'fone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      'kit ferramentas': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100&h=100&fit=crop',
      'serra': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop',
      'batedeira': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
      'aspirador': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
      'air fryer': 'https://images.unsplash.com/photo-1585515656643-1eb50b9e71b9?w=100&h=100&fit=crop',
      'cafeteira': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop',
      'parafusadeira': 'https://images.unsplash.com/photo-1609205264511-e7e3b7b6e5b5?w=100&h=100&fit=crop',
      'panela': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
      'forno': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=100&h=100&fit=crop',
      'console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&h=100&fit=crop',
      'furadeira': 'https://images.unsplash.com/photo-1609205264511-e7e3b7b6e5b5?w=100&h=100&fit=crop',
      'liquidificador': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
      'geladeira': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=100&h=100&fit=crop',
      'máquina': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'
    };
    
    const productKey = Object.keys(imageMap).find(key => 
      productName.toLowerCase().includes(key)
    );
    
    return imageMap[productKey] || 'https://via.placeholder.com/100/FFE600/000000?text=PROD';
  };

  const filteredProducts = data.products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.categoria.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === '' || product.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(data.products.map(product => product.categoria))];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'em_estoque': { label: 'Em Estoque', class: 'status-em-estoque' },
      'enviado': { label: 'Enviado', class: 'status-enviado' },
      'pendente': { label: 'Pendente', class: 'status-pendente' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-meli-blue mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-corporate-main">
      {/* Header */}
      <header className="header-enhanced border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-4">
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  className="h-10 w-10 icon-enhanced"
                />
                <h1 className="text-3xl font-bold heading-corporate">
                  Mercado Livre - Dashboard Empresarial
                </h1>
              </div>
            </div>
            
            {/* Navegação por abas */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("gestores")}
                className={`tab-button ${activeTab === "gestores" ? "active" : ""}`}
              >
                Gestores
              </button>
              <button
                onClick={() => setActiveTab("mercadolivre")}
                className={`tab-button ${activeTab === "mercadolivre" ? "active" : ""}`}
              >
                Mercado Livre
              </button>
              
              {/* Informações do usuário e logout */}
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-300">
                <span className="text-sm text-gray-600">
                  Olá, <span className="font-medium">{user?.nome}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {activeTab === 'dashboard' && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por produto ou SKU..."
                    className="input-corporate pl-10 pr-4 py-3 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Dashboard Lateral */}
            <div className="lg:col-span-1 sidebar-corporate">
              <div className="space-y-6 p-6">
                {/* Métricas */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold heading-corporate">Métricas do CD</h2>
                  
                  <div className="metric-card-corporate animate-fade-in-scale">
                    <div className="flex items-center">
                      <Package className="h-10 w-10 text-meli-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium subheading-corporate">Total de Produtos</p>
                        <p className="text-3xl font-bold text-corporate-dark">{data.metrics.total_produtos}</p>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.1s'}}>
                    <div className="flex items-center">
                      <Clock className="h-10 w-10 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium subheading-corporate">Aguardando Envio</p>
                        <p className="text-3xl font-bold text-corporate-dark">{data.metrics.aguardando_envio}</p>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center">
                      <TrendingUp className="h-10 w-10 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium subheading-corporate">Tempo Médio (h)</p>
                        <p className="text-3xl font-bold text-corporate-dark">{data.metrics.tempo_medio_permanencia}</p>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.3s'}}>
                    <div className="flex items-center">
                      <BarChart3 className="h-10 w-10 text-meli-blue" />
                      <div className="ml-4">
                        <p className="text-sm font-medium subheading-corporate">Eficiência Operacional</p>
                        <p className="text-3xl font-bold text-corporate-dark">{data.metrics.eficiencia_operacional}%</p>
                        <div className="progress-bar mt-3">
                          <div 
                            className="progress-fill bg-meli-yellow" 
                            style={{ width: `${data.metrics.eficiencia_operacional}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Área Principal */}
            <div className="lg:col-span-3">
              {/* Filtros */}
              <div className="corporate-card mb-8 p-6">
                <div className="flex items-center space-x-4">
                  <Filter className="h-6 w-6 text-meli-blue icon-enhanced" />
                  <div className="flex flex-wrap gap-4">
                    <select
                      className="input-corporate px-4 py-3"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>

                    <select
                      className="input-corporate px-4 py-3"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Todos os status</option>
                      <option value="em_estoque">Em Estoque</option>
                      <option value="enviado">Enviado</option>
                      <option value="pendente">Pendente</option>
                    </select>

                    <div className="text-sm text-corporate-light flex items-center font-medium">
                      <Package className="h-4 w-4 mr-2 text-meli-blue" />
                      {filteredProducts.length} produtos encontrados
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.length === 0 && searchTerm !== '' && (
                  <p className="text-corporate-light text-center col-span-full">Nenhum produto encontrado para "{searchTerm}". Tente ajustar os filtros de busca.</p>
                )}
                {filteredProducts.length === 0 && searchTerm === '' && (
                  <p className="text-corporate-light text-center col-span-full">Nenhum produto encontrado. Tente ajustar os filtros de busca.</p>
                )}
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="corporate-card p-6 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={getProductImage(product.nome)}
                        alt={product.nome}
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-corporate-dark truncate">{product.nome}</h3>
                        <p className="text-sm subheading-corporate mt-1 font-medium">SKU: {product.sku}</p>
                        <div className="mt-3">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="subheading-corporate font-medium">Quantidade:</span>
                        <span className="font-bold text-corporate-dark">{product.quantidade} unidades</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="subheading-corporate font-medium">Categoria:</span>
                        <span className="font-bold text-meli-blue">{product.categoria}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="subheading-corporate font-medium">Tempo no CD:</span>
                        <span className="font-bold text-corporate-dark">{product.tempo_permanencia}h</span>
                      </div>
                    </div>

                    <button className="btn-corporate-primary w-full mt-6">
                      Visualizar Mais
                    </button>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros de busca.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gestores' && (
          <div className="space-y-8">
            {/* Sub-navegação da aba Gestores */}
            <div className="filter-container">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setActiveGestorSection("selecionar")}
                  className={`gestor-section-button ${activeGestorSection === "selecionar" ? "active" : ""}`}
                >
                  <Users className="h-5 w-5" />
                  <span>Selecionar Gestor</span>
                </button>
                <button
                  onClick={() => setActiveGestorSection("chamado")}
                  className={`gestor-section-button ${activeGestorSection === "chamado" ? "active" : ""}`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Abrir Chamado</span>
                </button>
                <button
                  onClick={() => setActiveGestorSection("aprendizes")}
                  className={`gestor-section-button ${activeGestorSection === "aprendizes" ? "active" : ""}`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span>Área de Aprendizes</span>
                </button>
              </div>
            </div>

            {/* Seção Selecionar Gestor */}
            {activeGestorSection === 'selecionar' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Selecionar Gestor</h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar gestor por nome ou departamento..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gestores.map(gestor => (
                    <div key={gestor.id} className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-meli-blue rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{gestor.nome}</h3>
                          <p className="text-sm text-gray-600">{gestor.departamento}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {gestor.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Telefone:</span> {gestor.telefone}
                        </p>
                      </div>

                      <button className="w-full bg-meli-yellow text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors cursor-pointer">
                        Selecionar Gestor
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção Abrir Chamado */}
            {activeGestorSection === 'chamado' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Abrir Chamado</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto do Chamado
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent"
                        placeholder="Digite o assunto..."
                        value={chamadoForm.assunto}
                        onChange={(e) => setChamadoForm({...chamadoForm, assunto: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gestor Responsável
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent"
                        value={chamadoForm.gestorId}
                        onChange={(e) => setChamadoForm({...chamadoForm, gestorId: e.target.value})}
                      >
                        <option value="">Selecione um gestor...</option>
                        {gestores.map(gestor => (
                          <option key={gestor.id} value={gestor.id}>
                            {gestor.nome} - {gestor.departamento}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Chamado
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent"
                        value={chamadoForm.tipo}
                        onChange={(e) => setChamadoForm({...chamadoForm, tipo: e.target.value})}
                      >
                        <option value="">Selecione o tipo...</option>
                        <option value="problema_tecnico">Problema Técnico</option>
                        <option value="solicitacao">Solicitação</option>
                        <option value="feedback">Feedback</option>
                        <option value="duvida">Dúvida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridade
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent"
                        value={chamadoForm.prioridade}
                        onChange={(e) => setChamadoForm({...chamadoForm, prioridade: e.target.value})}
                      >
                        <option value="">Selecione a prioridade...</option>
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição Detalhada
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent"
                      placeholder="Descreva detalhadamente o chamado..."
                      value={chamadoForm.descricao}
                      onChange={(e) => setChamadoForm({...chamadoForm, descricao: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setChamadoForm({assunto: '', descricao: '', tipo: '', prioridade: '', gestorId: ''})}
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-meli-yellow text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors cursor-pointer"
                    >
                      Enviar Chamado
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Seção Área de Aprendizes */}
            {activeGestorSection === 'aprendizes' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Área de Aprendizes</h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar aprendiz por nome ou gestor..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meli-yellow focus:border-transparent w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aprendizes.map(aprendiz => (
                    <div key={aprendiz.id} className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{aprendiz.nome}</h3>
                          <p className="text-sm text-gray-600">Gestor: {aprendiz.gestor}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            aprendiz.status === 'ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {aprendiz.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progresso:</span>
                            <span className="font-medium">{aprendiz.progresso}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-meli-yellow h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${aprendiz.progresso}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tarefas:</span>
                          <span className="font-medium">{aprendiz.tarefas} concluídas</span>
                        </div>
                      </div>

                      <button className="w-full bg-meli-yellow text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors cursor-pointer">
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mercadolivre' && (
          <div className="space-y-8">
            {/* Seção Mercado Livre */}
            <div className="corporate-card p-8">
              <h2 className="text-2xl font-bold heading-corporate mb-6">Integração Mercado Livre</h2>
              
              {/* Métricas do Mercado Livre */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="metric-card-corporate animate-fade-in-scale">
                  <div className="flex items-center">
                    <Package className="h-10 w-10 text-meli-blue" />
                    <div className="ml-4">
                      <p className="text-sm font-medium subheading-corporate">Produtos Ativos</p>
                      <p className="text-3xl font-bold text-corporate-dark">{meliData.products.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.1s'}}>
                  <div className="flex items-center">
                    <TrendingUp className="h-10 w-10 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium subheading-corporate">Vendas Hoje</p>
                      <p className="text-3xl font-bold text-corporate-dark">{meliData.metrics.today?.sales_count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center">
                    <BarChart3 className="h-10 w-10 text-meli-blue" />
                    <div className="ml-4">
                      <p className="text-sm font-medium subheading-corporate">Faturamento</p>
                      <p className="text-3xl font-bold text-corporate-dark">
                        R$ {meliData.metrics.today?.revenue ? (meliData.metrics.today.revenue / 1000).toFixed(1) + 'k' : '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="metric-card-corporate animate-fade-in-scale" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center">
                    <Clock className="h-10 w-10 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium subheading-corporate">Pedidos Pendentes</p>
                      <p className="text-3xl font-bold text-corporate-dark">{meliData.metrics.today?.orders_pending || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funcionalidades do Mercado Livre */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <Package className="h-8 w-8 text-meli-blue mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Gestão de Produtos</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Gerencie seus produtos, preços e estoque diretamente no Mercado Livre.</p>
                  <button className="btn-corporate-primary w-full">
                    Acessar Produtos
                  </button>
                </div>

                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Relatórios de Vendas</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Acompanhe suas vendas, faturamento e performance em tempo real.</p>
                  <button className="btn-corporate-secondary w-full">
                    Ver Relatórios
                  </button>
                </div>

                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-purple-500 mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Atendimento</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Gerencie perguntas e mensagens dos compradores.</p>
                  <button className="btn-corporate-primary w-full">
                    Central de Mensagens
                  </button>
                </div>

                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Analytics</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Análise detalhada de performance e métricas de negócio.</p>
                  <button className="btn-corporate-secondary w-full">
                    Ver Analytics
                  </button>
                </div>

                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Alertas</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Receba notificações sobre estoque baixo, vendas e problemas.</p>
                  <button className="btn-corporate-primary w-full">
                    Configurar Alertas
                  </button>
                </div>

                <div className="corporate-card p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-8 w-8 text-indigo-500 mr-3" />
                    <h3 className="text-lg font-bold text-corporate-dark">Documentação API</h3>
                  </div>
                  <p className="subheading-corporate mb-4">Acesse a documentação completa da API do Mercado Livre.</p>
                  <button className="btn-corporate-secondary w-full">
                    Ver Documentação
                  </button>
                </div>
              </div>

              {/* Status da Integração */}
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h4 className="text-lg font-bold text-green-800">Status da Integração: Conectado</h4>
                </div>
                <p className="text-green-700 mt-2">
                  Sua conta está conectada com sucesso ao Mercado Livre. Última sincronização: há 5 minutos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer com texto do projeto */}
      <div className="fixed bottom-4 left-4">

        <div className="text-xs text-white bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          Dashboard Empresarial - Mercado Livre
        </div>
      </div>
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

