const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const parseProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    images_c: product.images_c ? JSON.parse(product.images_c) : [],
    dimensions_c: product.dimensions_c ? JSON.parse(product.dimensions_c) : { length: 0, width: 0, height: 0 }
  };
};

const productService = {
  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "sale_price_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "age_min_c"}},
          {"field": {"Name": "age_max_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "review_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "Tags"}}
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(parseProduct);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "sale_price_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "age_min_c"}},
          {"field": {"Name": "age_max_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "review_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "Tags"}}
        ]
      };
      
      const response = await apperClient.getRecordById('product_c', parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Product not found");
      }
      
      return parseProduct(response.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error.message);
      throw error;
    }
  },

  async getFeatured() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "sale_price_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "age_min_c"}},
          {"field": {"Name": "age_max_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "review_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "Tags"}}
        ],
        where: [{"FieldName": "is_featured_c", "Operator": "EqualTo", "Values": [true]}],
        pagingInfo: { limit: 100, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(parseProduct);
    } catch (error) {
      console.error("Error fetching featured products:", error.message);
      return [];
    }
  },
  
  async getDeals() {
    try {
      const allProducts = await this.getAll();
      return allProducts.filter(product => 
        product.sale_price_c !== null && 
        product.sale_price_c !== undefined && 
        product.sale_price_c < product.price_c
      );
    } catch (error) {
      console.error("Error fetching deals:", error.message);
      return [];
    }
  },

  async getByCategory(category) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "sale_price_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "age_min_c"}},
          {"field": {"Name": "age_max_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "review_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "Tags"}}
        ],
        where: [{"FieldName": "category_c", "Operator": "EqualTo", "Values": [category]}],
        pagingInfo: { limit: 1000, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(parseProduct);
    } catch (error) {
      console.error("Error fetching products by category:", error.message);
      return [];
    }
  },

  async search(query) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "brand_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "sale_price_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "age_min_c"}},
          {"field": {"Name": "age_max_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "stock_quantity_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "review_count_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "dimensions_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "material_c"}},
          {"field": {"Name": "Tags"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [{"fieldName": "name_c", "operator": "Contains", "values": [query]}],
              "operator": ""
            },
            {
              "conditions": [{"fieldName": "brand_c", "operator": "Contains", "values": [query]}],
              "operator": ""
            },
            {
              "conditions": [{"fieldName": "description_c", "operator": "Contains", "values": [query]}],
              "operator": ""
            },
            {
              "conditions": [{"fieldName": "category_c", "operator": "Contains", "values": [query]}],
              "operator": ""
            }
          ]
        }],
        pagingInfo: { limit: 1000, offset: 0 }
      };
      
      const response = await apperClient.fetchRecords('product_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(parseProduct);
    } catch (error) {
      console.error("Error searching products:", error.message);
      return [];
    }
  }
};

const getSimilarProducts = async (productId, limit = 4) => {
  try {
    const product = await productService.getById(productId);
    if (!product) return [];

    const allProducts = await productService.getAll();
    
    const similar = allProducts
      .filter(p => {
        if (p.Id === product.Id) return false;
        const sameCategoryOrTag = 
          p.category_c === product.category_c ||
          (p.Tags && product.Tags && p.Tags.split(',').some(tag => product.Tags.split(',').includes(tag)));
        const similarPrice = Math.abs(p.price_c - product.price_c) < product.price_c * 0.5;
        return sameCategoryOrTag || similarPrice;
      })
      .sort((a, b) => {
        const aCategoryMatch = a.category_c === product.category_c ? 1 : 0;
        const bCategoryMatch = b.category_c === product.category_c ? 1 : 0;
        if (aCategoryMatch !== bCategoryMatch) return bCategoryMatch - aCategoryMatch;
        return Math.abs(a.price_c - product.price_c) - Math.abs(b.price_c - product.price_c);
      })
      .slice(0, limit);

    return similar;
  } catch (error) {
    console.error("Error fetching similar products:", error.message);
    return [];
  }
};

const getFrequentlyBoughtTogether = async (productIds, limit = 4) => {
  try {
    if (!productIds || productIds.length === 0) return [];

    const allProducts = await productService.getAll();
    const cartProducts = allProducts.filter(p => productIds.includes(p.Id));
    const cartCategories = [...new Set(cartProducts.map(p => p.category_c))];
    const cartTags = [...new Set(cartProducts.flatMap(p => p.Tags ? p.Tags.split(',') : []))];

    const recommendations = allProducts
      .filter(p => {
        if (productIds.includes(p.Id)) return false;
        const productTags = p.Tags ? p.Tags.split(',') : [];
        const hasRelatedTag = productTags.some(tag => cartTags.includes(tag));
        const differentCategory = !cartCategories.includes(p.category_c);
        return hasRelatedTag || (!differentCategory && Math.random() > 0.5);
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error("Error fetching frequently bought together:", error.message);
    return [];
  }
};

export default {
  ...productService,
  getSimilarProducts,
  getFrequentlyBoughtTogether
};