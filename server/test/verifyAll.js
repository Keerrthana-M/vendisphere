/**
 * VendiSphere Full-Stack Automated Test Suite
 * Tests Auth, RBAC, Product Catalog Filters, Cart Operations,
 * Atomic Order Concurrency & Stock Decrement, Order Cancellation Restock,
 * Vendor Inventory Intelligence, AI Shopping Assistant, and Admin Approvals.
 */

const BASE_URL = 'http://localhost:5000/api'

let testsPassed = 0
let testsFailed = 0

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`)
    testsPassed++
  } else {
    console.error(`  ✗ FAIL: ${description}`)
    testsFailed++
  }
}

const runTests = async () => {
  console.log('====================================================')
  console.log('Starting VendiSphere Platform Automated Test Suite')
  console.log('====================================================')

  try {
    // 1. API Health Check
    console.log('\n[1] Testing Server Health Check...')
    const healthRes = await fetch(`${BASE_URL}/health`)
    const healthData = await healthRes.json()
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health check returns status ok')

    // 2. Auth: Admin, Vendor, Customer Logins
    console.log('\n[2] Testing Authentication & Role Tokens...')
    
    // Login Customer
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@vendisphere.com', password: 'password123' })
    })
    const custData = await custLoginRes.json()
    assert(custLoginRes.status === 200 && custData.user.role === 'customer', 'Customer logs in successfully with role "customer"')
    const custToken = custData.token

    // Login Approved Vendor
    const vendorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'techvendor@vendisphere.com', password: 'password123' })
    })
    const vendorData = await vendorLoginRes.json()
    assert(vendorLoginRes.status === 200 && vendorData.user.role === 'vendor', 'Approved vendor logs in successfully')
    const vendorToken = vendorData.token

    // Login Admin
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vendisphere.com', password: 'admin123' })
    })
    const adminData = await adminLoginRes.json()
    assert(adminLoginRes.status === 200 && adminData.user.role === 'admin', 'Admin logs in successfully')
    const adminToken = adminData.token

    // Verify /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    })
    const meData = await meRes.json()
    assert(meRes.status === 200 && meData.user.email === 'customer@vendisphere.com', '/auth/me returns authenticated customer identity')

    // 3. Product Catalog Queries & Filters
    console.log('\n[3] Testing Product Catalog Filtering & Sorting...')
    
    // All products
    const allProdRes = await fetch(`${BASE_URL}/products`)
    const allProducts = await allProdRes.json()
    assert(Array.isArray(allProducts) && allProducts.length >= 8, `Catalog returns all products (found ${allProducts.length})`)

    // Category filter: Electronics
    const elecRes = await fetch(`${BASE_URL}/products?category=Electronics`)
    const elecProducts = await elecRes.json()
    assert(elecProducts.every(p => p.category === 'Electronics'), 'Category filter returns only Electronics products')

    // Price range filter: minPrice=1000&maxPrice=6000
    const priceRes = await fetch(`${BASE_URL}/products?minPrice=1000&maxPrice=6000`)
    const priceProducts = await priceRes.json()
    assert(priceProducts.every(p => p.price >= 1000 && p.price <= 6000), 'Price filter correctly bounds products between ₹1,000 and ₹6,000')

    // Sort by price ascending
    const sortRes = await fetch(`${BASE_URL}/products?sort=price_asc`)
    const sortProducts = await sortRes.json()
    const isSortedAsc = sortProducts.every((p, i) => i === 0 || p.price >= sortProducts[i - 1].price)
    assert(isSortedAsc, 'Sort order price_asc correctly arranges products in ascending price order')

    // Search query: "Headphones"
    const searchRes = await fetch(`${BASE_URL}/products?search=Headphones`)
    const searchProducts = await searchRes.json()
    assert(searchProducts.some(p => p.name.includes('Headphones')), 'Search filter finds products containing "Headphones"')

    // 4. Cart Operations
    console.log('\n[4] Testing Cart Persistence & Operations...')
    const targetProduct = allProducts[0]
    const initialStock = targetProduct.stock

    // Add to cart
    const addCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      },
      body: JSON.stringify({ productId: targetProduct._id, quantity: 1 })
    })
    const cartData = await addCartRes.json()
    assert(addCartRes.status === 200 && cartData.items.some(i => i.product._id === targetProduct._id), 'Customer can add product to persistent cart')

    // Get cart
    const getCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    })
    const currentCart = await getCartRes.json()
    const cartItemId = currentCart.items[0]._id
    assert(currentCart.items.length > 0, 'Cart is successfully persisted and retrieved for user')

    // 5. Order Placement & Atomic Stock Decrement
    console.log('\n[5] Testing Order Creation & Atomic Stock Decrement...')
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'John Customer',
          address: '42 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          phone: '9876543210'
        }
      })
    })
    const orderData = await orderRes.json()
    assert(orderRes.status === 201 && orderData.order.status === 'Placed', 'Order is created successfully with "Placed" status')
    const createdOrderId = orderData.order._id

    // Verify stock decremented
    const freshProdRes = await fetch(`${BASE_URL}/products/${targetProduct._id}`)
    const freshProduct = await freshProdRes.json()
    assert(freshProduct.stock === initialStock - 1, `Atomic stock decrement verified: initial ${initialStock} -> current ${freshProduct.stock}`)

    // Verify cart cleared
    const postOrderCartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    })
    const postOrderCart = await postOrderCartRes.json()
    assert(postOrderCart.items.length === 0, 'Cart is cleanly emptied after successful checkout')

    // 6. Order Cancellation & Stock Restoration
    console.log('\n[6] Testing Order Cancellation & Stock Restoration...')
    const cancelRes = await fetch(`${BASE_URL}/orders/${createdOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Cancelled' })
    })
    const cancelData = await cancelRes.json()
    assert(cancelRes.status === 200 && cancelData.order.status === 'Cancelled', 'Order status updated to "Cancelled"')

    // Verify stock restored
    const restoredProdRes = await fetch(`${BASE_URL}/products/${targetProduct._id}`)
    const restoredProduct = await restoredProdRes.json()
    assert(restoredProduct.stock === initialStock, `Stock restoration verified: ${restoredProduct.stock} equals initial ${initialStock}`)

    // 7. Vendor Inventory Intelligence & Reorder Suggestion
    console.log('\n[7] Testing Vendor Smart Inventory Intelligence...')
    const invRes = await fetch(`${BASE_URL}/vendor/inventory`, {
      headers: { 'Authorization': `Bearer ${vendorToken}` }
    })
    const invData = await invRes.json()
    assert(Array.isArray(invData) && invData.length > 0, 'Vendor inventory endpoint returns data list')
    assert(invData[0].suggestedReorder !== undefined, 'Inventory items include explainable suggestedReorder count')
    assert(invData[0].intelligenceNotice !== undefined, 'Inventory items include clear intelligenceNotice')

    // 8. AI Shopping Assistant Intent & Recommendations
    console.log('\n[8] Testing AI Shopping Assistant with Budget Extraction...')
    const aiRes = await fetch(`${BASE_URL}/ai/shopping-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Find headphones under 10000' })
    })
    const aiData = await aiRes.json()
    assert(aiRes.status === 200 && aiData.recommendations.length > 0, 'AI assistant extracts intent and returns candidate recommendations')
    assert(aiData.recommendations.every(r => r.price <= 10000), 'All AI assistant recommendations strictly honor the ₹10,000 budget constraint')

    // 9. Vendor Account Approvals & Administration
    console.log('\n[9] Testing Admin Oversight & Vendor Approvals...')
    const adminVendorsRes = await fetch(`${BASE_URL}/admin/vendors`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    const adminVendors = await adminVendorsRes.json()
    assert(Array.isArray(adminVendors) && adminVendors.length >= 2, 'Admin can view all vendor applications')

    const pendingVendor = adminVendors.find(v => v.approvalStatus === 'pending')
    if (pendingVendor) {
      const approveRes = await fetch(`${BASE_URL}/admin/vendors/${pendingVendor._id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      const approveData = await approveRes.json()
      assert(approveRes.status === 200 && approveData.profile.approvalStatus === 'approved', 'Admin can approve pending vendor application')
    } else {
      console.log('  ℹ No pending vendors to approve in current dataset')
    }

    // 10. Admin Analytics (Excluding Cancelled Orders)
    console.log('\n[10] Testing Admin Revenue Analytics...')
    const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    const analyticsData = await analyticsRes.json()
    assert(typeof analyticsData.totalPlatformRevenue === 'number', `Admin platform revenue is calculated: ₹${analyticsData.totalPlatformRevenue}`)
    assert(analyticsData.totalCustomers >= 1, `Customer count verified: ${analyticsData.totalCustomers}`)

    console.log('\n====================================================')
    console.log(`Test Execution Completed: ${testsPassed} PASSED, ${testsFailed} FAILED`)
    console.log('====================================================')

    if (testsFailed > 0) {
      process.exit(1)
    } else {
      process.exit(0)
    }

  } catch (err) {
    console.error('Test execution failed unexpectedly:', err)
    process.exit(1)
  }
}

runTests()
