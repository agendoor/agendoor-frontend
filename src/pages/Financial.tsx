import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import '../styles/financial.css';

interface FinancialMetrics {
  faturamentoRecebido: number;
  faturamentoEstimado: number;
  valorAReceber: number;
  despesas: number;
  lucroLiquido: number;
  crescimentoMensal: number;
}

interface Transaction {
  id: string;
  data: string;
  cliente: string;
  servico: string;
  categoria: string;
  valor: number;
  status: string;
  tipo: string;
  formaPagamento?: string;
}

interface PaymentMethod {
  name: string;
  value: number;
  percentage: number;
  color: string;
}


const Financial: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados do resumo financeiro (novo sistema com transações reais)
  const fetchFinancialSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/financial/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar resumo financeiro');
      
      const data = await response.json();
      
      // Atualizar métricas com dados reais do backend
      setMetrics({
        faturamentoRecebido: data.receitasRealizadas || 0,
        faturamentoEstimado: data.receitasFuturas || 0,
        valorAReceber: data.atrasados || 0,
        despesas: data.custoProdutos || 0,
        lucroLiquido: data.lucroTotal || 0,
        crescimentoMensal: 0 // Será implementado depois
      });
      
      // Buscar transações para calcular formas de pagamento
      const transResponse = await fetch('/api/financial/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (transResponse.ok) {
        const transData = await transResponse.json();
        setTransactions(transData.transactions || []);
        
        // Calcular distribuição de formas de pagamento das transações reais
        const paymentMethodsMap: { [key: string]: number } = {};
        transData.transactions?.forEach((t: Transaction) => {
          if (t.formaPagamento) {
            paymentMethodsMap[t.formaPagamento] = (paymentMethodsMap[t.formaPagamento] || 0) + t.valor;
          }
        });
        
        const total = Object.values(paymentMethodsMap).reduce((sum, val) => sum + val, 0);
        
        if (total > 0) {
          const methods: PaymentMethod[] = [];
          const colors: { [key: string]: string } = {
            'PIX': '#8b5cf6',
            'CARTÃO': '#3b82f6',
            'DINHEIRO': '#10b981',
            'PLANO': '#f59e0b',
            'CONVÊNIO': '#ec4899'
          };
          
          Object.entries(paymentMethodsMap).forEach(([name, value]) => {
            methods.push({
              name,
              value,
              percentage: Math.round((value / total) * 100),
              color: colors[name] || '#6b7280'
            });
          });
          
          setPaymentMethods(methods);
        }
      }
    } catch (err) {
      setError('Erro ao carregar dados financeiros');
      console.error(err);
    }
  };

  // Carregar dados quando o componente for montado
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFinancialSummary();
      setLoading(false);
    };

    loadData();
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'billing' | 'reports' | 'products'>('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'Concluído';
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'CANCELLED': return 'Cancelado';
      case 'NO_SHOW': return 'Faltou';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return '#10b981';
      case 'CONFIRMED': return '#3b82f6';
      case 'PENDING': return '#f59e0b';
      case 'CANCELLED': return '#ef4444';
      case 'NO_SHOW': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="financial-page">
        <TopBar />
        <div className="financial-container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <p>Carregando dados financeiros...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-page">
        <TopBar />
        <div className="financial-container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px', color: '#ef4444' }}>❌</div>
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px' }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-page">
      <TopBar />
      
      <div className="financial-container">
        <div className="page-header">
          <div className="header-content">
            <h1>💰 Gestão Financeira</h1>
            <p>Controle completo das finanças da sua clínica</p>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-secondary">
              📊 Relatório Mensal
            </button>
            <button className="btn btn-primary">
              💳 Nova Transação
            </button>
          </div>
        </div>

        <div className="financial-navigation">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="tab-icon">📈</span>
              <span className="tab-label">Visão Geral</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <span className="tab-icon">💸</span>
              <span className="tab-label">Transações</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              <span className="tab-icon">🧾</span>
              <span className="tab-label">Cobrança</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="tab-icon">📊</span>
              <span className="tab-label">Relatórios</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <span className="tab-icon">📦</span>
              <span className="tab-label">Produtos</span>
            </button>
          </div>
        </div>

        <div className="financial-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              <div className="metrics-grid">
                <div className="metric-card revenue">
                  <div className="metric-icon">✅</div>
                  <div className="metric-info">
                    <h3>Receitas Realizadas</h3>
                    <div className="metric-value">{metrics ? formatCurrency(metrics.faturamentoRecebido) : 'R$ 0,00'}</div>
                    <div className="metric-growth positive">Atendimentos finalizados</div>
                  </div>
                </div>

                <div className="metric-card expenses">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-info">
                    <h3>Receitas Futuras</h3>
                    <div className="metric-value">{metrics ? formatCurrency(metrics.faturamentoEstimado) : 'R$ 0,00'}</div>
                    <div className="metric-growth neutral">Agendamentos confirmados</div>
                  </div>
                </div>

                <div className="metric-card profit">
                  <div className="metric-icon">⚠️</div>
                  <div className="metric-info">
                    <h3>Atrasados</h3>
                    <div className="metric-value">{metrics ? formatCurrency(metrics.valorAReceber) : 'R$ 0,00'}</div>
                    <div className="metric-growth warning">
                      Agendamentos não finalizados
                    </div>
                  </div>
                </div>

                <div className="metric-card pending">
                  <div className="metric-icon">💎</div>
                  <div className="metric-info">
                    <h3>Lucro Líquido</h3>
                    <div className="metric-value">{metrics ? formatCurrency(metrics.lucroLiquido) : 'R$ 0,00'}</div>
                    <div className="metric-growth positive">
                      Margem: {metrics && metrics.faturamentoRecebido > 0 ? ((metrics.lucroLiquido / metrics.faturamentoRecebido) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h3>🎯 Formas de Pagamento</h3>
                  <div className="payment-methods">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="payment-method">
                        <div className="method-info">
                          <div className="method-name">{method.name}</div>
                          <div className="method-percentage">{method.percentage}%</div>
                        </div>
                        <div className="method-bar">
                          <div 
                            className="method-progress" 
                            style={{ width: `${method.percentage}%`, backgroundColor: method.color }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>📅 Fluxo de Caixa Semanal</h3>
                  <div className="cash-flow-chart">
                    <div className="chart-placeholder">
                      <div className="chart-bars">
                        <div className="bar" style={{ height: '80%' }}></div>
                        <div className="bar" style={{ height: '65%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '75%' }}></div>
                        <div className="bar" style={{ height: '85%' }}></div>
                        <div className="bar" style={{ height: '70%' }}></div>
                        <div className="bar" style={{ height: '95%' }}></div>
                      </div>
                      <div className="chart-labels">
                        <span>Seg</span>
                        <span>Ter</span>
                        <span>Qua</span>
                        <span>Qui</span>
                        <span>Sex</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-content">
              <div className="transactions-header">
                <h3>💸 Movimentações Recentes</h3>
                <div className="filter-actions">
                  <select className="filter-select">
                    <option value="">Todas as categorias</option>
                    <option value="consultas">Consultas</option>
                    <option value="cirurgia">Cirurgia</option>
                    <option value="ortodontia">Ortodontia</option>
                    <option value="materiais">Materiais</option>
                  </select>
                  <select className="filter-select">
                    <option value="">Todos os status</option>
                    <option value="paid">Pago</option>
                    <option value="pending">Pendente</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>
              </div>

              <div className="transactions-table">
                <div className="table-header">
                  <div>Data</div>
                  <div>Descrição</div>
                  <div>Cliente</div>
                  <div>Categoria</div>
                  <div>Valor</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>
                
                {transactions.map(transaction => (
                  <div key={transaction.id} className="table-row">
                    <div>{formatDate(transaction.data)}</div>
                    <div className="transaction-description">
                      <span className={`type-indicator ${transaction.tipo}`}>
                        {transaction.tipo === 'receita' ? '↗️' : '↙️'}
                      </span>
                      {transaction.servico}
                    </div>
                    <div>{transaction.cliente || '-'}</div>
                    <div>{transaction.categoria}</div>
                    <div className={`amount ${transaction.tipo}`}>
                      {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                    </div>
                    <div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(transaction.status) }}
                      >
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Ver detalhes">👁️</button>
                      <button className="btn-icon" title="Editar">✏️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="billing-content">
              <div className="billing-section">
                <h3>🧾 Sistema de Cobrança</h3>
                <p>Gerencie cobranças, boletos e lembretes de pagamento</p>
                
                <div className="billing-cards">
                  <div className="billing-card">
                    <div className="card-icon">📄</div>
                    <h4>Gerar Boleto</h4>
                    <p>Emita boletos registrados para seus pacientes</p>
                    <button className="btn btn-primary">Novo Boleto</button>
                  </div>
                  
                  <div className="billing-card">
                    <div className="card-icon">⏰</div>
                    <h4>Régua de Cobrança</h4>
                    <p>Configure lembretes automáticos</p>
                    <button className="btn btn-secondary">Configurar</button>
                  </div>
                  
                  <div className="billing-card">
                    <div className="card-icon">🔍</div>
                    <h4>Análise de Crédito</h4>
                    <p>Consulte CPF e score de crédito</p>
                    <button className="btn btn-secondary">Consultar</button>
                  </div>
                  
                  <div className="billing-card">
                    <div className="card-icon">💳</div>
                    <h4>Parcelamento</h4>
                    <p>Configure opções de financiamento</p>
                    <button className="btn btn-secondary">Configurar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-content">
              <div className="reports-section">
                <h3>📊 Relatórios Financeiros</h3>
                <p>Análises detalhadas para tomada de decisão</p>
                
                <div className="reports-grid">
                  <div className="report-card">
                    <div className="report-icon">📈</div>
                    <h4>Demonstrativo de Resultados</h4>
                    <p>Receitas, despesas e lucro por período</p>
                    <button className="btn btn-outline">Gerar Relatório</button>
                  </div>
                  
                  <div className="report-card">
                    <div className="report-icon">💰</div>
                    <h4>Fluxo de Caixa</h4>
                    <p>Entradas e saídas detalhadas</p>
                    <button className="btn btn-outline">Gerar Relatório</button>
                  </div>
                  
                  <div className="report-card">
                    <div className="report-icon">📋</div>
                    <h4>Inadimplência</h4>
                    <p>Clientes em atraso e ações de cobrança</p>
                    <button className="btn btn-outline">Gerar Relatório</button>
                  </div>
                  
                  <div className="report-card">
                    <div className="report-icon">🎯</div>
                    <h4>Performance por Serviço</h4>
                    <p>Rentabilidade por tipo de tratamento</p>
                    <button className="btn btn-outline">Gerar Relatório</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-content">
              <div className="products-section">
                <h3>📦 Desempenho de Produtos</h3>
                <p>Análise de rentabilidade e custos de produtos</p>
                
                <div className="metrics-grid" style={{ marginTop: '24px' }}>
                  <div className="metric-card revenue">
                    <div className="metric-icon">💰</div>
                    <div className="metric-info">
                      <h3>Receita de Produtos</h3>
                      <div className="metric-value">
                        {metrics ? formatCurrency(metrics.despesas) : 'R$ 0,00'}
                      </div>
                      <div className="metric-growth neutral">Total vendido</div>
                    </div>
                  </div>

                  <div className="metric-card expenses">
                    <div className="metric-icon">📉</div>
                    <div className="metric-info">
                      <h3>Custo de Produtos</h3>
                      <div className="metric-value">
                        {metrics ? formatCurrency(metrics.despesas) : 'R$ 0,00'}
                      </div>
                      <div className="metric-growth neutral">Custo total</div>
                    </div>
                  </div>

                  <div className="metric-card profit">
                    <div className="metric-icon">💎</div>
                    <div className="metric-info">
                      <h3>Lucro com Produtos</h3>
                      <div className="metric-value">
                        {metrics ? formatCurrency(Math.max(0, metrics.lucroLiquido)) : 'R$ 0,00'}
                      </div>
                      <div className="metric-growth positive">Margem de lucro</div>
                    </div>
                  </div>
                </div>

                <div className="chart-card" style={{ marginTop: '24px' }}>
                  <h3>📊 Produtos Mais Vendidos</h3>
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    <p>Gráfico de produtos mais vendidos será exibido aqui</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      Implemente análise de produtos por quantidade vendida e lucro gerado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Financial;