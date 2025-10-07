const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const parseOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    items_c: order.items_c ? JSON.parse(order.items_c) : []
  };
};

const orderService = {
  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "estimated_delivery_c"}}
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(parseOrder);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      return [];
    }
  },

  async getById(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('Order ID must be an integer');
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "estimated_delivery_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('order_c', id, params);
      
      if (!response.success || !response.data) {
        throw new Error(`Order with ID ${id} not found`);
      }
      
      return parseOrder(response.data);
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error.message);
      throw error;
    }
  },

  async create(order) {
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const params = {
        records: [{
          Name: orderNumber,
          user_id_c: order.userId || "guest",
          items_c: JSON.stringify(order.items),
          total_c: order.total,
          status_c: "Processing",
          order_date_c: new Date().toISOString(),
          estimated_delivery_c: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]
      };
      
      const response = await apperClient.createRecord('order_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create order:`, failed);
          throw new Error(failed[0].message || "Failed to create order");
        }
        
        return parseOrder(successful[0].data);
      }
      
      throw new Error("Failed to create order");
    } catch (error) {
      console.error("Error creating order:", error.message);
      throw error;
    }
  }
};

export default orderService;