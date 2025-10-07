import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import orderService from "@/services/api/orderService";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getById(parseInt(id));
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
      toast.error('Failed to load order details');
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
    return <Loading message="Loading order details..." />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadOrder}
      />
    );
  }

  if (!order) {
    return (
      <Error
        message="Order not found"
        onRetry={() => navigate('/orders')}
      />
    );
  }

  return (
    <div
    className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
    <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="mb-6 text-gray-600 hover:text-primary">
            <ApperIcon name="ArrowLeft" size={18} className="mr-2" />Back to Orders
                    </Button>
        {/* Order Header */}
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            className="bg-white rounded-xl shadow-card p-6 mb-6 border border-gray-100">
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">Order #{order.Name}
                    </h1>
                    <p className="text-gray-600">Placed on {new Date(order.order_date_c).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}
                    </p>
                </div>
                <div
                    className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status_c)}`}>
                    <ApperIcon name={getStatusIcon(order.status_c)} size={18} />
                    <span className="capitalize">{order.status_c}</span>
                </div>
            </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
                initial={{
                    opacity: 0,
                    x: -20
                }}
                animate={{
                    opacity: 1,
                    x: 0
                }}
                className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <ApperIcon name="Package" size={20} className="text-primary" />
                        <h2 className="text-xl font-display font-bold text-gray-900">Order Items ({order.items_c?.length || 0})
                                            </h2>
                    </div>
                    {order.items_c?.map((item, index) => <div
                        key={index}
                        className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:border-primary/20 transition-colors">
                        {/* Product Image */}
                        <div
                            className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                                <ApperIcon name="Package" size={32} className="text-gray-300" />
                            </div>}
                        </div>
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1 truncate">
                                {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}
                            </p>
                            <p className="font-semibold text-primary">${item.price?.toFixed(2)}each
                                                    </p>
                        </div>
                        {/* Item Total */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="font-semibold text-lg text-gray-900">${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    </div>)}
                </div>
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <ApperIcon name="DollarSign" size={20} className="text-success" />
                        <h2 className="text-xl font-display font-bold text-gray-900">Order Summary</h2>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold">
                        <span className="text-gray-700">Total</span>
                        <span
                            className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">${order.total_c?.toFixed(2)}
                        </span>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{
                    opacity: 0,
                    x: 20
                }}
                animate={{
                    opacity: 1,
                    x: 0
                }}
                className="space-y-6">
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <ApperIcon name="MapPin" size={20} className="text-secondary" />
                        <h2 className="text-xl font-display font-bold text-gray-900">Shipping Address</h2>
                    </div>
                    {order.shippingInfo ? <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Recipient</p>
                            <p className="font-medium text-gray-900">{order.shippingInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Address</p>
                            <p className="text-gray-900">{order.shippingInfo.address}</p>
                            <p className="text-gray-900">
                                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
                            </p>
                            <p className="text-gray-900">{order.shippingInfo.country}</p>
                        </div>
                    </div> : <p className="text-gray-500 text-sm">No shipping information available</p>}
                </div></motion.div>
        </div>
    </div>
</div>
  );
}