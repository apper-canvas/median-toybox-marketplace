import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import orderService from "@/services/api/orderService";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      processing: 'bg-info/10 text-info border-info/20',
      shipped: 'bg-secondary/10 text-secondary border-secondary/20',
      delivered: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-error/10 text-error border-error/20'
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      processing: 'Package',
      shipped: 'Truck',
      delivered: 'CheckCircle',
      cancelled: 'XCircle'
    };
    return icons[status?.toLowerCase()] || 'Clock';
  };

  if (loading) {
    return <Loading message="Loading your orders..." />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadOrders}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <Empty
        icon="ShoppingBag"
        title="No Orders Yet"
        message="You haven't placed any orders yet. Start shopping to see your orders here!"
        actionLabel="Browse Products"
        onAction={() => navigate('/catalog')}
      />
    );
  }

  return (
    <div
    className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
    <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
            <h1
                className="text-4xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">My Orders
                          </h1>
            <p className="text-gray-600">Track and manage your order history
                          </p>
        </div>
        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, index) => <motion.div
                key={order.Id}
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/orders/${order.Id}`)}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <ApperIcon name="Package" size={20} className="text-primary" />
                            <h3
                                className="font-display font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">Order #{order.Name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.order_date_c).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </p>
                    </div>
                    <div
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status_c)}`}>
                        <ApperIcon name={getStatusIcon(order.status_c)} size={14} />
                        <span className="capitalize">{order.status_c}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Items</p>
                        <div className="flex items-center gap-1.5">
                            <ApperIcon name="ShoppingBag" size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                                {order.items_c?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <div className="flex items-center justify-end gap-1.5">
                            <ApperIcon name="DollarSign" size={16} className="text-primary" />
                            <span
                                className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">${order.total_c?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    {/* View Details Arrow */}
                    <div
                        className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end text-primary group-hover:text-secondary transition-colors">
                        <span className="text-sm font-medium mr-2">View Details</span>
                        <ApperIcon
                            name="ChevronRight"
                            size={18}
                            className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div></motion.div>)}
        </div>
    </div>
</div>
  );
}