const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const reviewService = {
async getByProductId(productId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "product_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "comment_c"}},
          {"field": {"Name": "is_verified_purchase_c"}},
          {"field": {"Name": "helpful_count_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [{"FieldName": "product_id_c", "Operator": "EqualTo", "Values": [parseInt(productId)]}],
        pagingInfo: { limit: 1000, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('review_c', params);
      
      if (!response.success) {
        console.error(`Failed to fetch reviews for product ${productId}:`, response.message);
        return [];
      }
      
      // Handle case where data is undefined or null
      if (!response.data) {
        console.info(`No review data returned for product ${productId}. This may indicate RLS policies are restricting access.`);
        return [];
      }
      
      // Log review count for debugging
      console.info(`Fetched ${response.data.length} reviews for product ${productId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error.message);
      return [];
    }
  },

  async create(review) {
    try {
      const params = {
        records: [{
          Name: `Review by ${review.userName}`,
          product_id_c: review.productId,
          user_id_c: review.userId || "guest",
          user_name_c: review.userName,
          rating_c: review.rating,
          title_c: review.title || "",
          comment_c: review.comment,
          is_verified_purchase_c: review.isVerifiedPurchase || false,
          helpful_count_c: 0,
          created_at_c: new Date().toISOString()
        }]
      };
      
      const response = await apperClient.createRecord('review_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create review:`, failed);
          throw new Error(failed[0].message || "Failed to create review");
        }
        
        return successful[0].data;
      }
      
      throw new Error("Failed to create review");
    } catch (error) {
      console.error("Error creating review:", error.message);
      throw error;
    }
  }
};

export default reviewService;