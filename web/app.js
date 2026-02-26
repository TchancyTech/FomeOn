const API_BASE = '/api';

// Mock data (embedded for static deployment)
const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Pizza Place',
    category: 'Pizza',
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryFee: 2.5,
    image: '🍕',
    offer: 'Entrega gratis na primeira compra!'
  },
  {
    id: 2,
    name: 'Burger House',
    category: 'Burgers',
    rating: 4.4,
    deliveryTime: '25-35 min',
    deliveryFee: 1.99,
    image: '🍔',
    offer: 'Combo duplo com 20% OFF'
  },
  {
    id: 3,
    name: 'Sushi Prime',
    category: 'Sushi',
    rating: 4.8,
    deliveryTime: '30-45 min',
    deliveryFee: 3.5,
    image: '🍣',
    offer: 'Temaki grátis acima de R$ 60'
  },
  {
    id: 4,
    name: 'Pasta Bella',
    category: 'Massas',
    rating: 4.5,
    deliveryTime: '25-40 min',
    deliveryFee: 2.75,
    image: '🍝',
    offer: '2 massas pelo preço de 1 às quartas'
  }
];

const MOCK_MENUS = {
  1: [
    { id: 101, name: 'Margherita', price: 29.9 },
    { id: 102, name: 'Calabresa', price: 34.9 },
    { id: 103, name: 'Quatro Queijos', price: 36.9 }
  ],
  2: [
    { id: 201, name: 'Cheeseburger', price: 19.9 },
    { id: 202, name: 'Bacon Burger', price: 24.9 },
    { id: 203, name: 'Batata Frita', price: 12.9 }
  ],
  3: [
    { id: 301, name: 'Combo Sushi 20 peças', price: 54.9 },
    { id: 302, name: 'Hot Roll', price: 29.9 },
    { id: 303, name: 'Temaki Salmão', price: 21.9 }
  ],
  4: [
    { id: 401, name: 'Spaghetti Bolonhesa', price: 32.9 },
    { id: 402, name: 'Fettuccine Alfredo', price: 35.9 },
    { id: 403, name: 'Lasanha', price: 33.9 }
  ]
};

const restaurantsList = document.getElementById('restaurants-list');
const offersList = document.getElementById('offers-list');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const restaurantDetails = document.getElementById('restaurant-details');
const menuList = document.getElementById('menu-list');
const cartList = document.getElementById('cart-list');
const subtotalValue = document.getElementById('subtotal-value');
const deliveryValue = document.getElementById('delivery-value');
const totalValue = document.getElementById('total-value');
const clearCartBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const orderStatus = document.getElementById('order-status');
const viewOrderBtn = document.getElementById('view-order-btn');
const orderReceipt = document.getElementById('order-receipt');
const orderHistoryList = document.getElementById('order-history-list');
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('login-modal');
const loginModalClose = document.querySelector('.modal-close');
const loginModalActions = document.querySelectorAll('.modal-actions button');

const ORDER_HISTORY_KEY = 'fomeon_order_history';

const FOOD_IMAGES = {
  burger: 'https://cdn.pixabay.com/photo/2022/08/31/10/17/burger-7422970_1280.jpg',
  pizza: 'https://thumbs.dreamstime.com/b/vibrant-close-up-dripping-slice-pepperoni-pizza-melting-cheese-detailed-angled-shot-fresh-herbs-captured-mid-pull-331817729.jpg',
  sushi: 'https://img.freepik.com/premium-photo/gourmet-fresh-seafood-plate-sashimi-nigiri-maki-sushi-generated-by-ai_188544-13434.jpg?w=740',
  pasta: 'https://tse1.explicit.bing.net/th/id/OIP.sZKsa9IRThgsEeplTjKaSwHaLH?rs=1&pid=ImgDetMain&o=7&rm=3',
  salad: 'https://simple-veganista.com/wp-content/uploads/2020/03/best-house-salad-recipe_5-360x360.jpg'
};

let currentSearch = '';
let currentSort = '';
let currentRestaurants = [];
let selectedRestaurant = null;
let cartItems = [];
let lastOrder = null;
let orderHistory = [];

function loadOrderHistory() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY);
    if (!raw) {
      orderHistory = [];
      return;
    }

    const parsed = JSON.parse(raw);
    orderHistory = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch (error) {
    orderHistory = [];
  }
}

function saveOrderHistory() {
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory.slice(0, 3)));
}

function setOrderStatus(message, variant = '') {
  orderStatus.textContent = message;
  orderStatus.className = `order-status ${variant}`.trim();
}

function findRestaurantName(restaurantId) {
  const restaurant = currentRestaurants.find((entry) => entry.id === restaurantId);
  return restaurant ? restaurant.name : `Restaurante #${restaurantId}`;
}

function hideReceipt() {
  orderReceipt.className = 'order-receipt';
  orderReceipt.innerHTML = '';
}

function renderOrderHistory() {
  if (!orderHistory.length) {
    orderHistoryList.innerHTML = '<div class="empty">Sem histórico por enquanto.</div>';
    return;
  }

  orderHistoryList.innerHTML = orderHistory
    .map(
      (order) => `
      <article class="history-item">
        <p><strong>${order.id}</strong> · ${order.restaurantName}</p>
        <p>Total: R$ ${Number(order.quote.total).toFixed(2)} · ${order.estimatedDelivery}</p>
      </article>
    `
    )
    .join('');
}

function renderReceipt() {
  if (!lastOrder) {
    setOrderStatus('Nenhum pedido finalizado ainda.', 'error');
    hideReceipt();
    return;
  }

  const itemsHtml = lastOrder.items
    .map(
      (item) =>
        `<li>${item.quantity}x ${item.name} — R$ ${(Number(item.price) * Number(item.quantity)).toFixed(2)}</li>`
    )
    .join('');

  orderReceipt.className = 'order-receipt visible';
  orderReceipt.innerHTML = `
    <h4>Resumo do pedido</h4>
    <p><strong>ID:</strong> ${lastOrder.id}</p>
    <p><strong>Restaurante:</strong> ${lastOrder.restaurantName}</p>
    <p><strong>Entrega estimada:</strong> ${lastOrder.estimatedDelivery}</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Subtotal:</strong> R$ ${Number(lastOrder.quote.subtotal).toFixed(2)}</p>
    <p><strong>Entrega:</strong> R$ ${Number(lastOrder.quote.deliveryFee).toFixed(2)}</p>
    <p><strong>Total:</strong> R$ ${Number(lastOrder.quote.total).toFixed(2)}</p>
  `;
}

function pushOrderToHistory(order) {
  orderHistory = [order, ...orderHistory.filter((entry) => entry.id !== order.id)].slice(0, 3);
  saveOrderHistory();
  renderOrderHistory();
}

async function quoteCart(items) {
  // Calculate quote locally
  if (!items || items.length === 0) {
    return null;
  }

  const restaurantId = items[0].restaurantId;
  const restaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId);
  
  if (!restaurant) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  return {
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    total: total.toFixed(2)
  };
}

function formatFee(value) {
  return Number(value) === 0 ? 'Grátis' : `R$ ${Number(value).toFixed(2)}`;
}

function getRestaurantImageUrl(restaurant) {
  const category = String(restaurant.category || '').toLowerCase();
  const name = String(restaurant.name || '').toLowerCase();

  if (category.includes('sushi') || name.includes('sushi')) {
    return FOOD_IMAGES.sushi;
  }

  if (category.includes('massa') || name.includes('pasta')) {
    return FOOD_IMAGES.pasta;
  }

  if (category.includes('burger') || name.includes('burger')) {
    return FOOD_IMAGES.burger;
  }

  if (category.includes('pizza')) {
    return FOOD_IMAGES.pizza;
  }

  return FOOD_IMAGES.salad;
}

function renderRestaurants(restaurants) {
  if (!restaurants.length) {
    restaurantsList.innerHTML = '<div class="empty">Nenhum restaurante encontrado.</div>';
    return;
  }

  restaurantsList.innerHTML = restaurants
    .map(
      (restaurant) => `
      <article class="restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'active' : ''}" data-restaurant-id="${restaurant.id}">
        <div class="restaurant-top">
          <img class="restaurant-image" src="${getRestaurantImageUrl(restaurant)}" alt="${restaurant.name}" loading="lazy" />
          <span class="rating">⭐ ${restaurant.rating}</span>
        </div>
        <h4>${restaurant.name}</h4>
        <p class="meta">${restaurant.category} · ${restaurant.deliveryTime}</p>
        <p class="meta">Taxa de entrega: ${formatFee(restaurant.deliveryFee)}</p>
      </article>
    `
    )
    .join('');
}

function openLoginModal() {
  loginModal.setAttribute('aria-hidden', 'false');
  loginModal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  loginModal.setAttribute('aria-hidden', 'true');
  loginModal.classList.remove('visible');
  document.body.style.overflow = '';
}

  loginBtn?.addEventListener('click', openLoginModal);
  loginModalClose?.addEventListener('click', closeLoginModal);

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && loginModal?.classList.contains('visible')) {
      closeLoginModal();
    }
  });

  loginModalActions.forEach((button) => {
    button.addEventListener('click', () => {
      const role = button.getAttribute('data-role');
      const action = button.getAttribute('data-action');
      const actionText = action === 'login' ? 'Entrar' : 'Criar conta';
      const roleText = role === 'restaurant' ? 'Restaurante' : 'Cliente';
      alert(`${actionText} como ${roleText} (mock).`);
      closeLoginModal();
    });
  });

function renderOffers(offers) {
  offersList.innerHTML = offers
    .map(
      (offer) => `
      <article class="offer-card">
        <strong>${offer.restaurantName}</strong>
        <p>${offer.text}</p>
      </article>
    `
    )
    .join('');
}

function renderRestaurantDetails() {
  if (!selectedRestaurant) {
    restaurantDetails.className = 'empty';
    restaurantDetails.textContent = 'Escolha um restaurante para ver o menu.';
    menuList.innerHTML = '';
    return;
  }

  restaurantDetails.className = '';
  restaurantDetails.innerHTML = `
    <div class="restaurant-detail-head">
      <div>
        <h4>${selectedRestaurant.name}</h4>
        <p class="meta">${selectedRestaurant.category} · ${selectedRestaurant.deliveryTime}</p>
      </div>
      <div class="rating">⭐ ${selectedRestaurant.rating}</div>
    </div>
    <p class="meta">Taxa de entrega: ${formatFee(selectedRestaurant.deliveryFee)}</p>
  `;
}

function renderMenu(menu) {
  if (!menu.length) {
    menuList.innerHTML = '<div class="empty">Sem itens no menu.</div>';
    return;
  }

  menuList.innerHTML = menu
    .map(
      (item) => `
      <article class="menu-item">
        <div>
          <strong>${item.name}</strong>
          <p class="meta">R$ ${Number(item.price).toFixed(2)}</p>
        </div>
        <button type="button" data-menu-id="${item.id}">Adicionar</button>
      </article>
    `
    )
    .join('');
}

function renderCart() {
  if (!cartItems.length) {
    cartList.className = 'cart-list empty';
    cartList.textContent = 'Carrinho vazio.';
    return;
  }

  cartList.className = 'cart-list';
  cartList.innerHTML = cartItems
    .map(
      (item) => `
      <article class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p class="meta">R$ ${Number(item.price).toFixed(2)} cada</p>
        </div>
        <div class="cart-actions">
          <button type="button" data-cart-action="decrease" data-menu-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-menu-id="${item.id}">+</button>
        </div>
      </article>
    `
    )
    .join('');
}

async function updateCartSummary() {
  if (!cartItems.length) {
    subtotalValue.textContent = 'R$ 0.00';
    deliveryValue.textContent = 'R$ 0.00';
    totalValue.textContent = 'R$ 0.00';
    return;
  }

  const quote = await quoteCart(cartItems);

  if (!quote) {
    subtotalValue.textContent = 'Erro';
    deliveryValue.textContent = 'Erro';
    totalValue.textContent = 'Erro';
    return;
  }

  subtotalValue.textContent = `R$ ${Number(quote.subtotal).toFixed(2)}`;
  deliveryValue.textContent = `R$ ${Number(quote.deliveryFee).toFixed(2)}`;
  totalValue.textContent = `R$ ${Number(quote.total).toFixed(2)}`;
}

async function fetchMenu(restaurantId) {
  menuList.innerHTML = '<div class="empty">Carregando menu...</div>';

  // Use local mock menu data
  const menu = MOCK_MENUS[restaurantId] || [];
  renderMenu(menu);
}

function addItemToCart(menuItem) {
  if (cartItems.length && cartItems[0].restaurantId !== menuItem.restaurantId) {
    setOrderStatus('Carrinho aceita itens de apenas 1 restaurante por vez.', 'error');
    return;
  }

  const existing = cartItems.find((item) => item.id === menuItem.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ ...menuItem, quantity: 1 });
  }

  setOrderStatus('');
  renderCart();
  updateCartSummary();
}

function updateItemQuantity(menuId, action) {
  const item = cartItems.find((entry) => entry.id === menuId);
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  }

  if (action === 'decrease') {
    item.quantity -= 1;
  }

  cartItems = cartItems.filter((entry) => entry.quantity > 0);
  renderCart();
  updateCartSummary();
}

async function fetchRestaurants() {
  // Use local mock data instead of API
  let filtered = MOCK_RESTAURANTS.filter((restaurant) => {
    const matchesSearch =
      !currentSearch ||
      restaurant.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesSearch;
  });

  // Apply sorting
  if (currentSort === 'rating_desc') {
    filtered = filtered.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === 'delivery_fee_asc') {
    filtered = filtered.sort((a, b) => a.deliveryFee - b.deliveryFee);
  }

  currentRestaurants = filtered;

  if (selectedRestaurant) {
    selectedRestaurant = currentRestaurants.find((item) => item.id === selectedRestaurant.id) || null;
  }

  renderRestaurants(filtered);
}

async function fetchOffers() {
  // Use offers from mock restaurants
  const offers = MOCK_RESTAURANTS.filter(r => r.offer).map(r => ({
    restaurantName: r.name,
    text: r.offer
  }));
  renderOffers(offers);
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  currentSearch = searchInput.value.trim();
  fetchRestaurants();
});

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  fetchRestaurants();
});

restaurantsList.addEventListener('click', (event) => {
  const card = event.target.closest('[data-restaurant-id]');
  if (!card) return;

  const restaurantId = Number(card.dataset.restaurantId);
  selectedRestaurant = currentRestaurants.find((item) => item.id === restaurantId) || null;
  renderRestaurants(currentRestaurants);
  renderRestaurantDetails();
  fetchMenu(restaurantId);
});

menuList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-menu-id]');
  if (!button || !selectedRestaurant) return;

  const menuId = Number(button.dataset.menuId);

  const menuItemCard = button.closest('.menu-item');
  const titleElement = menuItemCard?.querySelector('strong');
  const priceElement = menuItemCard?.querySelector('.meta');

  const name = titleElement ? titleElement.textContent : 'Item';
  const priceText = priceElement ? priceElement.textContent.replace('R$ ', '') : '0';
  const price = Number(priceText);

  addItemToCart({ id: menuId, name, price, restaurantId: selectedRestaurant.id });
});

cartList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;

  const action = button.dataset.cartAction;
  const menuId = Number(button.dataset.menuId);
  updateItemQuantity(menuId, action);
});

clearCartBtn.addEventListener('click', () => {
  cartItems = [];
  setOrderStatus('Carrinho limpo.');
  hideReceipt();
  renderCart();
  updateCartSummary();
});

checkoutBtn.addEventListener('click', async () => {
  if (!cartItems.length) {
    setOrderStatus('Adicione itens no carrinho antes de finalizar.', 'error');
    return;
  }

  const restaurantId = cartItems[0].restaurantId;
  const itemsSnapshot = cartItems.map((item) => ({ ...item }));
  const quote = await quoteCart(itemsSnapshot);

  if (!quote) {
    setOrderStatus('Erro ao calcular total do pedido.', 'error');
    return;
  }

  setOrderStatus('Enviando pedido...');
  checkoutBtn.disabled = true;

  try {
    // Create mock order locally
    const orderId = `ORD${Date.now()}`;
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    const estimatedDelivery = deliveryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    lastOrder = {
      id: orderId,
      estimatedDelivery: estimatedDelivery,
      restaurantId,
      restaurantName: findRestaurantName(restaurantId),
      items: itemsSnapshot,
      quote
    };
    pushOrderToHistory(lastOrder);

    setOrderStatus(
      `Pedido ${orderId} criado com sucesso. Entrega estimada: ${estimatedDelivery}.`,
      'success'
    );

    cartItems = [];
    renderCart();
    updateCartSummary();
    renderReceipt();
  } catch (error) {
    setOrderStatus('Falha de conexão ao criar pedido.', 'error');
  } finally {
    checkoutBtn.disabled = false;
  }
});

viewOrderBtn.addEventListener('click', () => {
  renderReceipt();
});

fetchOffers();
fetchRestaurants();
loadOrderHistory();
renderOrderHistory();
renderRestaurantDetails();
renderCart();
updateCartSummary();
hideReceipt();
