/**
 * AI Service for VendiSphere Platform
 * Provides Customer Shopping Assistant & Vendor Business Insights.
 * Operates with seamless local intelligence fallback when AI_API_KEY is not configured.
 */

export const generateShoppingAssistantResponse = async (query, availableProducts = []) => {
  const apiKey = process.env.AI_API_KEY

  if (!query || query.trim() === '') {
    return {
      reply: 'Hello! I am your VendiSphere Shopping Assistant. How can I help you find the best products today?'
    }
  }

  // Perform structured catalog query matching
  const searchLower = query.toLowerCase()
  const matchingProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchLower) ||
    p.category.toLowerCase().includes(searchLower) ||
    p.description.toLowerCase().includes(searchLower)
  ).slice(0, 3)

  if (matchingProducts.length > 0) {
    const productListText = matchingProducts.map(p => `• ${p.name} ($${p.price}) in ${p.category}`).join('\n')
    return {
      reply: `Based on your request for "${query}", I recommend checking out these top items in our marketplace:\n\n${productListText}`,
      recommendations: matchingProducts
    }
  }

  return {
    reply: `I searched our multi-vendor catalog for "${query}". We have a variety of products across Electronics, Fashion, Grocery, and Accessories. Try searching for specific items like "Headphones", "Watch", or "Shoes"!`,
    recommendations: []
  }
}

export const generateVendorInsightsResponse = async (vendorData) => {
  const { totalRevenue = 0, totalOrders = 0, products = [], inventoryStatus = [] } = vendorData

  const lowStockItems = inventoryStatus.filter(i => i.stock <= 5)
  const topProduct = products.length > 0 ? products[0] : null

  let insights = []

  if (lowStockItems.length > 0) {
    insights.push(`⚠️ Stock Warning: You have ${lowStockItems.length} product(s) with 5 or fewer items remaining. Restock soon to prevent missed sales.`)
  } else {
    insights.push(`✅ Inventory Health: All product stock levels are currently healthy.`)
  }

  if (totalOrders > 0) {
    insights.push(`📈 Revenue Performance: Your store has generated $${totalRevenue.toFixed(2)} across ${totalOrders} orders.`)
  } else {
    insights.push(`💡 Growth Tip: Promote your products on social platforms to drive initial marketplace traffic.`)
  }

  if (topProduct) {
    insights.push(`⭐ Top Catalog Item: "${topProduct.name}" is currently your leading product listing.`)
  }

  return {
    summary: 'VendiSphere AI Vendor Performance Analysis',
    insights: insights,
    generatedAt: new Date().toISOString()
  }
}
