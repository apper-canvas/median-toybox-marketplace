import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const navigate = useNavigate();

  const getStockStatus = () => {
if (product.stock_quantity_c === 0) return { text: "Out of Stock", color: "error" };
    if (product.stock_quantity_c <= 10) return { text: `Only ${product.stock_quantity_c} left`, color: "warning" };
    return { text: "In Stock", color: "success" };
  };

  const stockStatus = getStockStatus();
  const displayPrice = product.sale_price_c || product.price_c;
  const hasDiscount = product.sale_price_c && product.sale_price_c < product.price_c;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover overflow-hidden border border-gray-100 transition-all cursor-pointer group"
      onClick={() => navigate(`/product/${product.Id}`)}
    >
      <div className="relative h-56 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        <img
          src={product.images_c?.[0]} 
          alt={product.name_c}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="age">
            {product.age_min_c}-{product.age_max_c} years
          </Badge>
          {hasDiscount && (
            <Badge variant="error" className="bg-gradient-to-r from-error to-pink-500 text-white">
SALE
            </Badge>
          )}
          {product.is_featured_c && (
            <Badge variant="primary" className="bg-gradient-to-r from-accent to-yellow-400 text-gray-900">
              Featured
            </Badge>
          )}
        </div>
        <button
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist(product);
          }}
        >
          <ApperIcon name="Heart" className="w-5 h-5 text-gray-700 hover:text-error" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-display font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name_c}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{product.brand_c}</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <ApperIcon
                key={i}
                name="Star"
                size={14}
                className={`${
                  i < Math.floor(product.rating_c)
                    ? "text-accent fill-accent"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating_c} ({product.review_count_c})
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.price_c.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full bg-${stockStatus.color}`} />
            <span className={`text-xs text-${stockStatus.color} font-medium`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

<Button
          variant="primary"
          className="w-full"
          disabled={product.stock_quantity_c === 0}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;