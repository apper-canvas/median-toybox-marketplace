import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ProductCarousel from "@/components/atoms/ProductCarousel";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import productService from "@/services/api/productService";
import reviewService from "@/services/api/reviewService";
const ProductDetailPage = ({ onAddToCart, onAddToWishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productData, reviewsData, similarProductsData] = await Promise.all([
        productService.getById(id),
        reviewService.getByProductId(id),
        productService.getSimilarProducts(id, 4)
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      setSimilarProducts(similarProductsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    loadProductData();
  }, [id]);

  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewChange = (field, value) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReview = async () => {
    if (reviewForm.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (reviewForm.comment.trim().length < 10) {
      toast.error("Review comment must be at least 10 characters");
      return;
    }

    try {
      setSubmittingReview(true);
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Get authenticated user info
      const userResponse = await apperClient.getUser();
      const userName = userResponse?.firstName && userResponse?.lastName 
        ? `${userResponse.firstName} ${userResponse.lastName}`
        : "Anonymous";
      const userId = userResponse?.userId || "guest";

      await reviewService.create({
        productId: parseInt(id),
        userId: userId,
        userName: userName,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        isVerifiedPurchase: false
      });

      toast.success("Review submitted successfully!");
      setReviewForm({ rating: 0, title: "", comment: "" });
      setShowReviewForm(false);
      await loadProductData();
    } catch (error) {
      console.error("Error submitting review:", error.message);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) return <Loading type="details" />;
  if (error) return <Error message={error} onRetry={loadProductData} />;
  if (!product) return null;

const stockStatus = product.stock_quantity_c === 0 ? "Out of Stock" :
                     product.stock_quantity_c <= 10 ? `Only ${product.stock_quantity_c} left` :
                     "In Stock";
  const displayPrice = product.sale_price_c || product.price_c;
  const hasDiscount = product.sale_price_c && product.sale_price_c < product.price_c;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
src={product.images_c[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
<div className="flex gap-2 overflow-x-auto mt-4">
            {/* Thumbnail images */}
            {(product.images_c || []).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-gray-200"
                }`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
<Badge variant="age">
                {product.age_min_c}-{product.age_max_c} years
              </Badge>
              {hasDiscount && <Badge variant="error">SALE</Badge>}
              {product.is_featured_c && <Badge variant="primary">Featured</Badge>}
            </div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              {product.name_c}
            </h1>
            <p className="text-lg text-gray-600">{product.brand_c}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <ApperIcon
                  key={i}
                  name="Star"
                  className={`w-5 h-5 ${
i < Math.floor(product.rating_c)
                      ? "text-accent fill-accent"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating_c} ({product.review_count_c} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
<span className="text-4xl font-display font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-500 line-through">
                ${product.price_c.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
<div className={`w-3 h-3 rounded-full ${
              product.stock_quantity_c === 0 ? "bg-error" :
              product.stock_quantity_c <= 10 ? "bg-warning" :
              "bg-success"
            }`} />
            <span className={`font-medium ${
              product.stock_quantity_c === 0 ? "text-error" :
              product.stock_quantity_c <= 10 ? "text-warning" :
              "text-success"
            }`}>
              {stockStatus}
            </span>
          </div>

          <div className="border-t border-b border-gray-200 py-6 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-gray-900 mb-2">Description</h3>
<p className="text-gray-600">{product.description_c}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900">{product.category_c}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Material</p>
                <p className="font-medium text-gray-900">{product.material_c}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-medium text-gray-900">{product.weight_c} lbs</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dimensions</p>
                <p className="font-medium text-gray-900">
                  {product.dimensions_c?.length}" × {product.dimensions_c?.width}" × {product.dimensions_c?.height}"
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-gray-900 font-medium">Quantity:</label>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  <ApperIcon name="Minus" className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
onClick={() => setQuantity(Math.min(product.stock_quantity_c, quantity + 1))}
                  disabled={quantity >= product.stock_quantity_c}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity_c === 0}
                className="flex-1"
              >
                <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onAddToWishlist(product)}
              >
                <ApperIcon name="Heart" className="w-5 h-5" />
              </Button>
            </div>

            <Button
variant="secondary"
              size="lg"
              onClick={handleBuyNow}
              disabled={product.stock_quantity_c === 0}
              className="w-full"
            >
              <ApperIcon name="Zap" className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
<div className="border-t border-gray-200 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Customer Reviews ({reviews.length})
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        </div>
        
{showReviewForm && (
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-4">
              Write Your Review
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      disabled={submittingReview}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      <ApperIcon
                        name="Star"
                        className={`w-8 h-8 transition-colors ${
                          star <= reviewForm.rating
                            ? "text-accent fill-accent"
                            : "text-gray-300 hover:text-accent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => handleReviewChange("title", e.target.value)}
                  disabled={submittingReview}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-error">*</span>
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => handleReviewChange("comment", e.target.value)}
                  disabled={submittingReview}
                  placeholder="Share your thoughts about this product (minimum 10 characters)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewForm({ rating: 0, title: "", comment: "" });
                  }}
                  disabled={submittingReview}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewForm.rating === 0 || reviewForm.comment.trim().length < 10}
                >
                  {submittingReview ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {reviews.length === 0 && !showReviewForm ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </Button>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.Id} className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-display font-semibold text-gray-900">
                        {review.user_name_c}
                      </p>
                      {review.is_verified_purchase_c && (
                        <Badge variant="success">
                          <ApperIcon name="CheckCircle" className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <ApperIcon
                            key={i}
                            name="Star"
                            className={`w-4 h-4 ${
                              i < review.rating_c
                                ? "text-accent fill-accent"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.created_at_c), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                
                {review.title_c && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title_c}</h4>
                )}
                <p className="text-gray-600 mb-4">{review.comment_c}</p>
                
                <button className="text-sm text-gray-500 hover:text-primary transition-colors">
                  <ApperIcon name="ThumbsUp" className="w-4 h-4 inline mr-1" />
                  Helpful ({review.helpful_count_c})
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Products Carousel */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <ProductCarousel
            products={similarProducts}
            title="Similar Products You May Like"
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;