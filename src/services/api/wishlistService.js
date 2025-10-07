import { toast } from 'react-toastify';
import { store } from '@/store/store';

const wishlistService = {
  /**
   * Get current user's wishlist with full product details
   * Uses referenceField to fetch product information in a single query
   */
  async getUserWishlist() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Get user from Redux store
      const state = store.getState();
// Access userId with multiple fallback paths to handle different Redux state structures
      const userId = state.user?.user?.userId || state.user?.userId || state.user?.user?.id;
      
      // Add detailed logging if userId is not found to help diagnose Redux state structure
      if (!userId) {
        console.error('User ID not found in Redux state. User object structure:', JSON.stringify(state.user, null, 2));
      }
      if (!userId) {
        console.error('User not authenticated');
        return [];
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "Name" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "description_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "price_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "sale_price_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "image_url_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "category_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "stock_quantity_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "rating_c" }
            }
          },
          { 
            field: { Name: "product_id_c" },
            referenceField: {
              field: { Name: "age_range_c" }
            }
          }
        ],
        where: [
          {
            FieldName: "user_id_c",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords('wishlist_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      // Transform the response to extract product details from the lookup
      return response.data.map(item => ({
        Id: item.Id,
        product_id_c: {
          Id: item.product_id_c?.Id,
          Name: item.product_id_c?.Name,
          description_c: item.product_id_c?.description_c,
          price_c: item.product_id_c?.price_c,
          sale_price_c: item.product_id_c?.sale_price_c,
          image_url_c: item.product_id_c?.image_url_c,
          category_c: item.product_id_c?.category_c,
          stock_quantity_c: item.product_id_c?.stock_quantity_c,
          rating_c: item.product_id_c?.rating_c,
          age_range_c: item.product_id_c?.age_range_c
        }
      }));
    } catch (error) {
      console.error("Error fetching wishlist:", error?.message || error);
      return [];
    }
  },

  /**
   * Add a product to user's wishlist
   * @param {number} productId - The product ID to add
   * @returns {Promise<boolean>} Success status
   */
  async addToWishlist(productId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Get user from Redux store
      const state = store.getState();
// Access userId with multiple fallback paths to handle different Redux state structures
      const userId = state.user?.user?.userId || state.user?.userId || state.user?.user?.id;
      
      // Add detailed logging if userId is not found to help diagnose Redux state structure
      if (!userId) {
        console.error('User ID not found in Redux state. User object structure:', JSON.stringify(state.user, null, 2));
      }
      if (!userId) {
        toast.error('Please log in to add items to wishlist');
        return false;
      }

      // Only include Updateable fields as per field visibility
      const params = {
        records: [
          {
            user_id_c: parseInt(userId),
            product_id_c: parseInt(productId)
          }
        ]
      };

      const response = await apperClient.createRecord('wishlist_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to add to wishlist:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error?.message || error);
      toast.error("Failed to add to wishlist");
      return false;
    }
  },

  /**
   * Remove a product from user's wishlist
   * @param {number} wishlistItemId - The wishlist item ID to remove
   * @returns {Promise<boolean>} Success status
   */
  async removeFromWishlist(wishlistItemId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(wishlistItemId)]
      };

      const response = await apperClient.deleteRecord('wishlist_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to remove from wishlist:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error?.message || error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  },

  /**
   * Check if a product is in user's wishlist
   * @param {number} productId - The product ID to check
   * @param {Array} wishlist - Current wishlist array
   * @returns {boolean} Whether product is in wishlist
   */
  isInWishlist(productId, wishlist) {
    return wishlist.some(item => item.product_id_c?.Id === parseInt(productId));
  },

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   * @param {number} productId - The product ID to toggle
   * @param {Array} wishlist - Current wishlist array
   * @returns {Promise<object>} Result with success status and action taken
   */
  async toggleWishlist(productId, wishlist) {
    const wishlistItem = wishlist.find(item => item.product_id_c?.Id === parseInt(productId));
    
    if (wishlistItem) {
      // Remove from wishlist
      const success = await this.removeFromWishlist(wishlistItem.Id);
      return { success, action: 'removed' };
    } else {
      // Add to wishlist
      const success = await this.addToWishlist(productId);
      return { success, action: 'added' };
    }
  }
};

export default wishlistService;