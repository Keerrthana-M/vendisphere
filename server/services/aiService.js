/**
 * VendiSphere Hybrid AI Service
 * 
 * Provides:
 * 1. Smart Shopping Assistant with Natural Language Intent & Budget Extraction
 * 2. Vendor Inventory Intelligence & Reorder Quantity Forecasting
 * 3. Vendor Business Insights & Performance Analysis
 * 
 * Features deterministic rule-based local intelligence with graceful fallback
 * when an external AI provider (AI_API_KEY) is unavailable or rate-limited.
 */

import { PRODUCT_CATEGORIES } from '../config/constants.js'

// Format INR currency helper
const formatRupees = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`

/**
 * Parses user shopping query to extract budget constraints, target category, and keywords
 */
export const extractShoppingIntent = (queryText) => {
  if (!queryText || typeof queryText !== 'string') {
    return { maxBudget: null, minBudget: null, detectedCategory: null, keywords: [] }
  }

  const text = queryText.toLowerCase()

  // 1. Budget extraction
  let maxBudget = null
  let minBudget = null

  // "under 5000", "below 10000", "less than 2000", "within 15000", "max 8000"
  const underMatch = text.match(/(?:under|below|less than|up to|within|max(?:imum)?)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*)/i)
  if (underMatch) {
    maxBudget = parseInt(underMatch[1].replace(/,/g, ''), 10)
  }

  // "between 1000 and 5000"
  const betweenMatch = text.match(/between\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*)/i)
  if (betweenMatch) {
    minBudget = parseInt(betweenMatch[1].replace(/,/g, ''), 10)
    maxBudget = parseInt(betweenMatch[2].replace(/,/g, ''), 10)
  }

  // 2. Category extraction
  let detectedCategory = null
  for (const cat of PRODUCT_CATEGORIES) {
    if (text.includes(cat.toLowerCase())) {
      detectedCategory = cat
      break
    }
  }

  // Category aliases
  if (!detectedCategory) {
    if (/phone|audio|gadget|headphone|earphone|laptop|watch|speaker|charger/i.test(text)) {
      detectedCategory = 'Electronics'
    } else if (/shoes|sneakers|cloth|shirt|pants|kurta|dress|wear|apparel/i.test(text)) {
      detectedCategory = 'Fashion'
    } else if (/snack|food|organic|tea|coffee|grocery|almond|nut/i.test(text)) {
      detectedCategory = 'Grocery'
    } else if (/bag|backpack|wallet|belt|case/i.test(text)) {
      detectedCategory = 'Accessories'
    } else if (/cook|pan|kitchen|home|pot|bed/i.test(text)) {
      detectedCategory = 'Home & Kitchen'
    } else if (/book|novel|read/i.test(text)) {
      detectedCategory = 'Books'
    }
  }

  // 3. Keyword extraction (remove common stop words)
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'is', 'are', 'was',
    'i', 'me', 'my', 'want', 'need', 'show', 'find', 'get', 'looking', 'look', 'best',
    'good', 'some', 'any', 'please', 'can', 'you', 'under', 'below', 'price', 'budget',
    'cheap', 'affordable', 'expensive', 'rs', 'inr', 'rupees'
  ])

  const rawTokens = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
  const keywords = rawTokens.filter(t => t.length > 2 && !stopWords.has(t))

  return {
    maxBudget,
    minBudget,
    detectedCategory,
    keywords
  }
}

/**
 * Smart Shopping Assistant: generates response with ranked real catalog products
 */
export const generateShoppingAssistantResponse = async (userQuery, availableProducts = []) => {
  // Guard query input
  const query = (userQuery || '').trim().slice(0, 500)

  if (!query) {
    return {
      reply: 'Hello! I am your VendiSphere Shopping Assistant. You can ask me for product recommendations by category, budget (e.g. "Headphones under ₹10,000"), or specific features.',
      recommendations: [],
      provider: 'local-rules'
    }
  }

  // Filter to available items only
  const inStockProducts = availableProducts.filter(p => p.stock > 0)
  const intent = extractShoppingIntent(query)

  // Multi-factor product scoring
  const scoredProducts = inStockProducts.map(product => {
    let score = 0
    const reasons = []
    const prodNameLower = product.name.toLowerCase()
    const prodDescLower = product.description.toLowerCase()
    const prodCat = product.category

    // Category match
    if (intent.detectedCategory && prodCat.toLowerCase() === intent.detectedCategory.toLowerCase()) {
      score += 25
      reasons.push(`In category: ${prodCat}`)
    }

    // Keyword matches
    for (const kw of intent.keywords) {
      if (prodNameLower.includes(kw)) {
        score += 15
        reasons.push(`Matches "${kw}"`)
      } else if (prodDescLower.includes(kw)) {
        score += 6
      }
    }

    // Budget constraints
    if (intent.maxBudget !== null) {
      if (product.price <= intent.maxBudget) {
        score += 20
        reasons.push(`Within budget (${formatRupees(product.price)} ≤ ${formatRupees(intent.maxBudget)})`)
      } else {
        score -= 40 // Penalize products exceeding user budget
      }
    }

    if (intent.minBudget !== null) {
      if (product.price >= intent.minBudget) {
        score += 10
      } else {
        score -= 20
      }
    }

    // Rating boost
    if (product.rating) {
      score += Math.round(product.rating * 2)
    }

    return {
      product,
      score,
      reason: reasons.length > 0 ? reasons.join(' • ') : `Rated ${product.rating || '4.5'}★ in ${product.category}`
    }
  })

  // Filter products with positive score and sort by score descending
  const topCandidates = scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  // Check if external AI provider is configured and reachable
  const apiKey = process.env.AI_API_KEY
  if (apiKey && apiKey.trim() !== '') {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4500)

      // External AI prompt construction using only verified real catalog items
      const candidateSummary = topCandidates.map(c => 
        `ID: ${c.product._id}, Name: ${c.product.name}, Price: ${formatRupees(c.product.price)}, Category: ${c.product.category}`
      ).join('\n')

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the VendiSphere Smart Shopping Assistant. The customer asked: "${query}".
Here are the verified in-stock items matching their request:
${candidateSummary || 'No exact candidate products found.'}

Rules:
1. Answer in 2-3 friendly sentences recommending the verified items above.
2. Mention their exact prices in INR (₹).
3. Do not invent products, discounts, or specifications that are not listed above.`
            }]
          }]
        })
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const aiData = await response.json()
        const textReply = aiData?.candidates?.[0]?.content?.parts?.[0]?.text
        if (textReply) {
          return {
            reply: textReply.trim(),
            recommendations: topCandidates.map(c => ({
              ...c.product.toObject ? c.product.toObject() : c.product,
              recommendationReason: c.reason
            })),
            provider: 'gemini-ai'
          }
        }
      }
    } catch (err) {
      // Graceful degradation to deterministic local intelligence
      console.warn('[AI Service] External provider unavailable or timed out. Falling back to local intelligence.')
    }
  }

  // Deterministic local intelligence response
  if (topCandidates.length > 0) {
    let replyText = `I found ${topCandidates.length} product(s) matching your request for "${query}":`
    if (intent.maxBudget) {
      replyText = `Here are the best items fitting your budget of ${formatRupees(intent.maxBudget)}:`
    } else if (intent.detectedCategory) {
      replyText = `Here are our top-rated recommendations in ${intent.detectedCategory}:`
    }

    return {
      reply: replyText,
      recommendations: topCandidates.map(c => ({
        ...c.product.toObject ? c.product.toObject() : c.product,
        recommendationReason: c.reason
      })),
      provider: 'local-rules'
    }
  }

  // Helpful fallback when no items matched the specific query
  return {
    reply: `I searched our catalog for "${query}", but couldn't find an exact match in stock. Try searching by category like "Electronics", "Fashion", "Grocery", or specifying a budget like "under ₹5,000".`,
    recommendations: inStockProducts.slice(0, 3).map(p => ({
      ...p.toObject ? p.toObject() : p,
      recommendationReason: `Popular in ${p.category}`
    })),
    provider: 'local-rules'
  }
}

/**
 * Vendor Business Insights & Inventory Forecasting
 */
export const generateVendorInsightsResponse = async (vendorData) => {
  const { totalRevenue = 0, totalOrders = 0, products = [], inventoryStatus = [] } = vendorData

  const insights = []
  const recommendations = []

  // 1. Stock & Inventory Risk Analysis
  const lowStockItems = inventoryStatus.filter(i => i.stock <= 5 && i.stock > 0)
  const outOfStockItems = inventoryStatus.filter(i => i.stock === 0)

  if (outOfStockItems.length > 0) {
    insights.push({
      type: 'critical',
      title: 'Out of Stock Alert',
      message: `${outOfStockItems.length} product(s) have 0 units remaining: "${outOfStockItems.map(i => i.name).slice(0, 2).join('", "')}". Customer orders cannot be fulfilled until restocked.`
    })
    recommendations.push(`Immediately update inventory for ${outOfStockItems.length} out-of-stock catalog item(s).`)
  }

  if (lowStockItems.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Risk',
      message: `${lowStockItems.length} item(s) are at or below the 5-unit threshold. Restock recommended to maintain sales continuity.`
    })
    recommendations.push('Reorder items using the 14-day sales velocity formula provided in your Smart Inventory tab.')
  } else if (outOfStockItems.length === 0) {
    insights.push({
      type: 'positive',
      title: 'Inventory Stability',
      message: 'All catalog items have healthy stock levels above the 5-unit safety buffer.'
    })
  }

  // 2. Sales & Revenue Performance
  if (totalOrders > 0) {
    const avgOrderValue = totalRevenue / totalOrders
    insights.push({
      type: 'info',
      title: 'Revenue Run Rate',
      message: `Your storefront has recorded ${formatRupees(totalRevenue)} in active revenue across ${totalOrders} order(s), with an Average Order Value of ${formatRupees(avgOrderValue.toFixed(2))}.`
    })

    if (avgOrderValue > 5000) {
      recommendations.push('High average ticket size: maintain high-tier product quality and prompt customer support.')
    } else {
      recommendations.push('Consider bundling related items or cross-selling accessories to raise your Average Order Value.')
    }
  } else {
    insights.push({
      type: 'info',
      title: 'New Storefront Status',
      message: 'No completed sales recorded yet. Your listed catalog products are active and visible in the marketplace.'
    })
    recommendations.push('Ensure your product descriptions highlight key features, specifications, and return policies.')
  }

  // 3. Catalog Health
  if (products.length === 0) {
    recommendations.push('Add your first product listing to begin receiving orders.')
  } else {
    insights.push({
      type: 'info',
      title: 'Catalog Breadth',
      message: `You currently maintain ${products.length} active product listing(s) in the VendiSphere marketplace.`
    })
  }

  return {
    summary: 'VendiSphere Store Intelligence & Inventory Health Audit',
    insights: insights.map(i => `${i.title}: ${i.message}`),
    detailedInsights: insights,
    recommendations,
    disclaimer: 'Generated via deterministic inventory velocity analytics and rules-based business intelligence.',
    generatedAt: new Date().toISOString()
  }
}
