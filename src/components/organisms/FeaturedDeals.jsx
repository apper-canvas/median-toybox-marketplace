import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import wishlistService from "@/services/api/wishlistService";

function FeaturedDeals({ products, onAddToCart, onAddToWishlist, wishlist }) {
  const navigate = useNavigate();

  const calculateDiscount = (price, salePrice) => {
    return Math.round(((price - salePrice) / price) * 100);
  };
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Featured Deals
          </h2>
          <p className="text-gray-600 mt-1">Limited time offers on amazing toys!</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/deals")}
          className="flex items-center gap-2"
        >
          View All Deals
          <ApperIcon name="ArrowRight" className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 3).map((product) => {
          const discount = calculateDiscount(product.price_c, product.sale_price_c);

          return (
            <motion.div
              key={product.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-card hover:shadow-card-hover overflow-hidden border border-gray-100 transition-all group relative"
            >
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Badge variant="error" className="bg-gradient-to-r from-error to-pink-500 text-white shadow-lg">
                  {discount}% OFF
                </Badge>
                {product.stock_quantity_c < 10 && (
                  <Badge variant="warning">
                    Only {product.stock_quantity_c} left!
                  </Badge>
                )}
              </div>

<button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                onClick={() => onAddToWishlist(product)}
              >
                <ApperIcon 
                  name="Heart" 
                  className={`w-5 h-5 ${
                    wishlist && wishlistService.isInWishlist(product.Id, wishlist)
                      ? 'fill-error text-error'
                      : 'text-gray-700 hover:text-error'
                  }`}
                />
              </button>

              <div
                className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${product.Id}`)}
              >
                <img
                  src={product.images_c?.[0]}
                  alt={product.name_c}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {product.brand_c}
                    </span>
                    {product.stock_quantity_c < 10 && (
                      <Badge variant="warning" className="text-xs">
                        Only {product.stock_quantity_c} left!
                      </Badge>
                    )}
                  </div>
                </div>

                <h3
                  className="text-lg font-display font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/product/${product.Id}`)}
                >
                  {product.name_c}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-display font-bold text-primary">
                    ${product.sale_price_c.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.price_c.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <ApperIcon
                        key={i}
                        name="Star"
                        size={16}
                        className={i < Math.floor(product.rating_c) ? "text-accent fill-accent" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating_c} ({product.review_count_c})
                  </span>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onAddToCart(product)}
                >
                  <ApperIcon name="ShoppingCart" className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <ApperIcon name="Baby" size={14} />
                  <span>Ages {product.age_min_c}-{product.age_max_c}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
);
}

export default FeaturedDeals;