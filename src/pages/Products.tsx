import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import '../styles/products.css';

interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
}

interface ProductAnalysis {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
}

interface FinancialAnalysisSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'analysis'>('products');
  const [financialAnalysis, setFinancialAnalysis] = useState<ProductAnalysis[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<FinancialAnalysisSummary | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    costPrice: '',
    salePrice: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'analysis') {
      loadFinancialAnalysis();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          costPrice: parseFloat(form.costPrice),
          salePrice: parseFloat(form.salePrice),
          stock: parseInt(form.stock) || 0
        })
      });

      if (response.ok) {
        await loadProducts();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category || '',
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      stock: product.stock.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      costPrice: '',
      salePrice: '',
      stock: ''
    });
    setEditingProduct(null);
  };

  const calculateProfit = (product: Product) => {
    return product.salePrice - product.costPrice;
  };

  const calculateMargin = (product: Product) => {
    if (product.salePrice === 0) return 0;
    return ((calculateProfit(product) / product.salePrice) * 100).toFixed(1);
  };

  const loadFinancialAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/financial-analysis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFinancialAnalysis(data.products || []);
      setAnalysisSummary(data.summary || null);
    } catch (error) {
      console.error('Erro ao carregar análise financeira:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="products-page">
        <TopBar />
        <div className="products-container">
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <TopBar />
      
      <div className="products-container">
        <div className="page-header">
          <div className="header-content">
            <h1>📦 Gerenciar Produtos</h1>
            <p>Controle de estoque e precificação</p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            ➕ Novo Produto
          </button>
        </div>

        <div className="products-navigation" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e5e7eb' }}>
            <button 
              onClick={() => setActiveTab('products')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: 500,
                color: activeTab === 'products' ? '#667eea' : '#6b7280',
                borderBottom: activeTab === 'products' ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📦 Produtos
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: 500,
                color: activeTab === 'analysis' ? '#667eea' : '#6b7280',
                borderBottom: activeTab === 'analysis' ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📊 Análise Financeira
            </button>
          </div>
        </div>

        {activeTab === 'products' && showForm && (
          <div className="product-form-card">
            <div className="form-header">
              <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome do Produto *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Ex: Resina Composta"
                  />
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex: Materiais, Medicamentos"
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Estoque Inicial</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Atualizar' : 'Salvar'} Produto
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'products' && (
        <div className="products-table-card">
          <h2>📋 Lista de Produtos ({products.length})</h2>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>Nenhum produto cadastrado</h3>
              <p>Comece adicionando seus primeiros produtos</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                ➕ Adicionar Produto
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Custo</th>
                    <th>Venda</th>
                    <th>Lucro Unit.</th>
                    <th>Margem</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category || '-'}</td>
                      <td>R$ {product.costPrice.toFixed(2)}</td>
                      <td>R$ {product.salePrice.toFixed(2)}</td>
                      <td className="profit">R$ {calculateProfit(product).toFixed(2)}</td>
                      <td className="margin">{calculateMargin(product)}%</td>
                      <td>
                        <span className={`stock-badge ${product.stock > 10 ? 'high' : product.stock > 0 ? 'medium' : 'low'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(product)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(product.id)}
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            {analysisLoading ? (
              <div className="loading-state">
                <div className="loading-spinner">⏳</div>
                <p>Carregando análise financeira...</p>
              </div>
            ) : (
              <>
                {analysisSummary && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', color: 'white' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Receita Total</div>
                      <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(analysisSummary.totalRevenue)}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '24px', color: 'white' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Custo Total</div>
                      <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(analysisSummary.totalCost)}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '24px', color: 'white' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Lucro Total</div>
                      <div style={{ fontSize: '28px', fontWeight: 700 }}>{formatCurrency(analysisSummary.totalProfit)}</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '12px', padding: '24px', color: 'white' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Margem de Lucro</div>
                      <div style={{ fontSize: '28px', fontWeight: 700 }}>{analysisSummary.profitMargin}%</div>
                    </div>
                  </div>
                )}

                <div className="products-table-card">
                  <h2>📊 Desempenho por Produto</h2>
                  
                  {financialAnalysis.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <h3>Nenhuma venda registrada</h3>
                      <p>Os dados de análise financeira aparecerão aqui após a primeira venda</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Qtd. Vendida</th>
                            <th>Receita</th>
                            <th>Custo</th>
                            <th>Lucro</th>
                            <th>Margem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialAnalysis.map((product, index) => (
                            <tr key={product.id} style={{ background: index < 3 ? '#f0fdf4' : 'transparent' }}>
                              <td className="product-name">
                                {product.name}
                                {index === 0 && <span style={{ marginLeft: '8px', fontSize: '18px' }}>🏆</span>}
                              </td>
                              <td>{product.category || '-'}</td>
                              <td>{product.quantitySold.toFixed(0)}</td>
                              <td>{formatCurrency(product.revenue)}</td>
                              <td>{formatCurrency(product.cost)}</td>
                              <td className="profit" style={{ fontWeight: 600, color: product.profit > 0 ? '#22c55e' : '#ef4444' }}>
                                {formatCurrency(product.profit)}
                              </td>
                              <td className="margin">
                                {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : '0.0'}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {financialAnalysis.length > 0 && (
                  <div style={{ marginTop: '30px', background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginBottom: '20px' }}>📈 Top 5 Produtos Mais Lucrativos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {financialAnalysis.slice(0, 5).map((product, index) => {
                        const maxProfit = financialAnalysis[0]?.profit || 1;
                        const percentage = (product.profit / maxProfit) * 100;
                        
                        return (
                          <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ minWidth: '150px', fontSize: '14px', fontWeight: 500 }}>{product.name}</div>
                            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '32px', position: 'relative', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  height: '100%',
                                  width: `${percentage}%`,
                                  background: index === 0 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 
                                             index === 1 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                                             index === 2 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                             'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                                  transition: 'width 0.5s ease'
                                }}
                              />
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '12px', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                                {formatCurrency(product.profit)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
