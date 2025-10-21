import React, { useState, useEffect } from 'react';
import '../styles/finalize-modal.css';

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  qty: number;
}

interface FinalizeModalProps {
  appointmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const FinalizeModal: React.FC<FinalizeModalProps> = ({ appointmentId, onClose, onSuccess }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING' | 'PARTIAL'>('PAID');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAppointmentDetails();
    loadProducts();
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.appointment?.service) {
          setServices([{
            id: data.appointment.service.id,
            name: data.appointment.service.name,
            price: data.appointment.service.price
          }]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do agendamento:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableProducts(data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleAddProduct = (product: Product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    const newQty = existing ? existing.qty + 1 : 1;
    
    // Stock validation
    if (newQty > product.stock) {
      setStockWarnings({
        ...stockWarnings,
        [product.id]: `Estoque insuficiente! Disponível: ${product.stock}`
      });
      return;
    }
    
    // Clear warning if stock is sufficient
    if (stockWarnings[product.id]) {
      const { [product.id]: _, ...rest } = stockWarnings;
      setStockWarnings(rest);
    }
    
    if (existing) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id ? { ...p, qty: newQty } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, qty: 1 }]);
    }
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
      // Clear warning when product is removed
      if (stockWarnings[productId]) {
        const { [productId]: _, ...rest } = stockWarnings;
        setStockWarnings(rest);
      }
      return;
    }
    
    const product = availableProducts.find(p => p.id === productId);
    if (product && qty > product.stock) {
      setStockWarnings({
        ...stockWarnings,
        [productId]: `Estoque insuficiente! Disponível: ${product.stock}`
      });
      return;
    }
    
    // Clear warning if stock is sufficient
    if (stockWarnings[productId]) {
      const { [productId]: _, ...rest } = stockWarnings;
      setStockWarnings(rest);
    }
    
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, qty } : p
    ));
  };

  const handleFinish = async () => {
    // Validations
    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento');
      return;
    }

    if (paymentStatus === 'PARTIAL') {
      const total = calculateTotal();
      const paid = parseFloat(paidAmount);
      
      if (!paidAmount || isNaN(paid)) {
        alert('Para pagamento parcial, informe o valor pago');
        return;
      }
      
      if (paid <= 0 || paid >= total) {
        alert('O valor pago deve ser maior que zero e menor que o total');
        return;
      }
      
      if (!dueDate) {
        alert('Para pagamento parcial, informe a data de vencimento do saldo');
        return;
      }
    }

    if (paymentStatus === 'PENDING' && !dueDate) {
      alert('Para pagamento pendente, informe a data de vencimento');
      return;
    }

    if (Object.keys(stockWarnings).length > 0) {
      alert('Corrija os problemas de estoque antes de finalizar');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody: any = {
        appointmentId,
        services,
        products: selectedProducts.map(p => ({
          id: p.id,
          name: p.name,
          salePrice: p.salePrice,
          qty: p.qty
        })),
        paymentMethod,
        paymentStatus,
        notes
      };

      if (paymentStatus === 'PARTIAL') {
        requestBody.paidAmount = parseFloat(paidAmount);
        requestBody.dueDate = dueDate;
      } else if (paymentStatus === 'PENDING') {
        requestBody.dueDate = dueDate;
      }

      const response = await fetch('/api/appointments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao finalizar atendimento');
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      alert('Erro ao finalizar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const serviceTotal = services.reduce((sum, s) => sum + s.price, 0);
    const productTotal = selectedProducts.reduce((sum, p) => sum + (p.salePrice * p.qty), 0);
    return serviceTotal + productTotal;
  };

  return (
    <div className="modal-overlay">
      <div className="finalize-modal">
        <div className="modal-header">
          <h2>✅ Finalizar Atendimento</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>💼 Serviços Realizados</h3>
            <div className="service-selector">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  const serviceName = prompt('Nome do serviço:');
                  const servicePrice = prompt('Valor do serviço (R$):');
                  if (serviceName && servicePrice) {
                    setServices([...services, {
                      id: Date.now().toString(),
                      name: serviceName,
                      price: parseFloat(servicePrice)
                    }]);
                  }
                }}
              >
                ➕ Adicionar Serviço
              </button>
              
              <div className="selected-items">
                {services.map(service => (
                  <div key={service.id} className="item-row">
                    <span>{service.name}</span>
                    <span className="price">R$ {service.price.toFixed(2)}</span>
                    <button 
                      className="btn-remove"
                      onClick={() => setServices(services.filter(s => s.id !== service.id))}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📦 Produtos Vendidos</h3>
            <select 
              className="product-select"
              onChange={(e) => {
                const product = availableProducts.find(p => p.id === e.target.value);
                if (product) {
                  handleAddProduct(product);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Selecione um produto...</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - R$ {product.salePrice.toFixed(2)} (Estoque: {product.stock})
                </option>
              ))}
            </select>

            <div className="selected-items">
              {selectedProducts.map(product => (
                <div key={product.id}>
                  <div className="item-row">
                    <span>{product.name}</span>
                    <div className="qty-control">
                      <button onClick={() => handleUpdateQty(product.id, product.qty - 1)}>−</button>
                      <input 
                        type="number" 
                        value={product.qty}
                        onChange={(e) => handleUpdateQty(product.id, parseInt(e.target.value) || 0)}
                        min="1"
                      />
                      <button onClick={() => handleUpdateQty(product.id, product.qty + 1)}>+</button>
                    </div>
                    <span className="price">R$ {(product.salePrice * product.qty).toFixed(2)}</span>
                  </div>
                  {stockWarnings[product.id] && (
                    <div style={{ 
                      color: '#dc2626', 
                      fontSize: '12px', 
                      marginTop: '4px', 
                      marginLeft: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ⚠️ {stockWarnings[product.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>💰 Status do Pagamento</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="paymentStatus"
                  value="PAID"
                  checked={paymentStatus === 'PAID'}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                />
                Pago
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="paymentStatus"
                  value="PENDING"
                  checked={paymentStatus === 'PENDING'}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                />
                Pendente
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="paymentStatus"
                  value="PARTIAL"
                  checked={paymentStatus === 'PARTIAL'}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                />
                Parcial
              </label>
            </div>

            {paymentStatus === 'PARTIAL' && (
              <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Valor Pago (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Ex: 150.00"
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                {paidAmount && !isNaN(parseFloat(paidAmount)) && (
                  <div style={{ fontSize: '14px', color: '#0369a1' }}>
                    Saldo Restante: R$ {(calculateTotal() - parseFloat(paidAmount)).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {(paymentStatus === 'PENDING' || paymentStatus === 'PARTIAL') && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Data de Vencimento {paymentStatus === 'PARTIAL' ? '(do saldo)' : ''}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>

          <div className="section">
            <h3>💳 Forma de Pagamento</h3>
            <select
              className="payment-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="PIX">PIX</option>
              <option value="CARTÃO">Cartão</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PLANO">Plano de Saúde</option>
              <option value="CONVÊNIO">Convênio</option>
            </select>
          </div>

          <div className="section">
            <h3>📝 Observações</h3>
            <textarea
              placeholder="Observações sobre o atendimento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="total-section">
            <div className="total-label">Total:</div>
            <div className="total-value">R$ {calculateTotal().toFixed(2)}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleFinish}
            disabled={loading || !paymentMethod}
          >
            {loading ? 'Finalizando...' : '✅ Salvar e Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizeModal;
