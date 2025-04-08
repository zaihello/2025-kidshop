<script>
import CartNavbar from '../../components/front/CartNavbar.vue'
export default {
  // name: "CheckoutPage",
  components:{CartNavbar},
};
</script>

<template>
    <div class="container mx-auto p-6">
      <div>
        <CartNavbar/>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- 訂單資訊 -->
        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Your Order</h2>
  
          <div class="space-y-4">
            <!-- 商品列表 -->
            <div class="flex justify-between">
              <div class="flex items-center space-x-4">
                <!-- <img src="https://via.placeholder.com/60" class="w-16 h-16 object-cover rounded" alt="Product" /> -->
                <div>
                  <p class="text-lg font-medium">3 Pack Babys Socks</p>
                  <p class="text-sm text-gray-500">Quantity: 3</p>
                </div>
              </div>
              <p class="text-lg font-medium">£78.00</p>
            </div>
  
            <div class="flex justify-between">
              <div class="flex items-center space-x-4">
                <!-- <img src="https://via.placeholder.com/60" class="w-16 h-16 object-cover rounded" alt="Product" /> -->
                <div>
                  <p class="text-lg font-medium">Chick Jumper</p>
                  <p class="text-sm text-gray-500">Quantity: 4</p>
                </div>
              </div>
              <p class="text-lg font-medium">£239.80</p>
            </div>
  
            <!-- 小計和運費 -->
            <div class="border-t pt-4">
              <div class="flex justify-between">
                <p>Subtotal</p>
                <p>£317.80</p>
              </div>
              <div class="flex justify-between">
                <p>Shipping</p>
                <p>Flat rate</p>
              </div>
              <div class="flex justify-between font-bold">
                <p>Total</p>
                <p>£317.80</p>
              </div>
            </div>
  
            <!-- 信用卡支付 -->
            <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">    
                <h2 class="text-2xl font-semibold text-gray-700 mb-4">Credit Card Payment</h2>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Card Number -->
                <div>
                    <label for="card-number" class="block text-sm font-medium text-gray-600">Card Number</label>
                    <input
                    type="text"
                    id="card-number"
                    v-model="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxlength="19"
                    class="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                
                <div class="grid grid-cols-2 gap-4">
                    <!-- Expiry Date -->
                    <div>
                        <label for="expiry-date" class="block text-sm font-medium text-gray-600">Expiry Date</label>
                        <input
                            type="text"
                            id="expiry-date"
                            v-model="expiryDate"
                            placeholder="MM/YY"
                            maxlength="5"
                            class="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <!-- CVC -->
                    <div>
                        <label for="cvc" class="block text-sm font-medium text-gray-600">CVC</label>
                        <input
                            type="text"
                            id="cvc"
                            v-model="cvc"
                            placeholder="123"
                            maxlength="4"
                            class="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <!-- Cardholder Name -->
                <div>
                    <label for="card-holder" class="block text-sm font-medium text-gray-600">Cardholder Name</label>
                    <input
                    type="text"
                    id="card-holder"
                    v-model="cardHolder"
                    placeholder="John Doe"
                    class="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    class="w-full mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Pay Now
                </button>
    </form>
  </div>
          </div>
        </div>
        
        <!-- 帳單資訊 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Billing Details</h2>
  
          <form class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="first-name" class="block text-sm font-medium">First name *</label>
                <input type="text" id="first-name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label for="last-name" class="block text-sm font-medium">Last name *</label>
                <input type="text" id="last-name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
  
            <div>
              <label for="company-name" class="block text-sm font-medium">Company name (optional)</label>
              <input type="text" id="company-name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
  
            <div>
              <label for="country" class="block text-sm font-medium">Country / Region *</label>
              <select id="country" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>United Kingdom (UK)</option>
                <!-- More countries here -->
              </select>
            </div>
  
            <div>
              <label for="address" class="block text-sm font-medium">Street address *</label>
              <input type="text" id="address" placeholder="House number and street name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
  
            <div>
              <label for="apartment" class="block text-sm font-medium">Apartment, suite, unit, etc. (optional)</label>
              <input type="text" id="apartment" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
  
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="town" class="block text-sm font-medium">Town / City *</label>
                <input type="text" id="town" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label for="postcode" class="block text-sm font-medium">Postcode *</label>
                <input type="text" id="postcode" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
  
            <div>
              <label for="phone" class="block text-sm font-medium">Phone *</label>
              <input type="text" id="phone" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
  
            <div>
              <label for="email" class="block text-sm font-medium">Email address *</label>
              <input type="email" id="email" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
  
            <div>
              <input type="checkbox" id="different-address" class="mr-2">
              <label for="different-address" class="text-sm font-medium">Ship to a different address?</label>
            </div>
  
            <div>
              <label for="order-notes" class="block text-sm font-medium">Order notes (optional)</label>
              <textarea id="order-notes" rows="4" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>
  
