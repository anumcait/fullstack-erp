import { useEffect, useState } from 'react';
import axios from 'axios';

// Shared lookups for subcontract forms: sub-contractor vendors + finished/raw items.
export const useSubcontractLookups = () => {
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/erp/purchase/suppliers?party_type=Sub-Contractor')
      .then(({ data }) => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]));
    axios.get('/api/erp/stores/items')
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
    axios.get('/api/erp/subcontract/orders')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, []);

  return { vendors, items, orders };
};

export const toItemOption = (it) => ({
  id: it.id,
  code: it.item_code,
  name: it.item_name,
  uom: it.unit?.short_name || it.unit?.name || '',
  rate: it.moving_average_cost || it.standard_cost || it.last_purchase_cost || 0,
});
