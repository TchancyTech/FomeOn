
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const restaurants = [
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

const menusByRestaurantId = {
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

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

app.get('/api/health', (req,res)=> res.json({status:'ok'}));

app.get('/api/restaurants', (req,res)=>{
  const search = normalizeText(req.query.search);
  const category = normalizeText(req.query.category);
  const sort = normalizeText(req.query.sort);

  let filtered = restaurants.filter((restaurant) => {
    const matchesSearch =
      !search ||
      normalizeText(restaurant.name).includes(search) ||
      normalizeText(restaurant.category).includes(search);

    const matchesCategory =
      !category || normalizeText(restaurant.category) === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === 'rating_desc') {
    filtered = filtered.sort((a, b) => b.rating - a.rating);
  }

  if (sort === 'delivery_fee_asc') {
    filtered = filtered.sort((a, b) => a.deliveryFee - b.deliveryFee);
  }

  res.json(filtered);
});

app.get('/api/restaurants/:id', (req, res) => {
  const restaurantId = Number(req.params.id);
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  return res.json(restaurant);
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  const restaurantId = Number(req.params.id);
  const menu = menusByRestaurantId[restaurantId];

  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' });
  }

  return res.json(menu);
});

app.get('/api/offers', (req, res) => {
  const offers = restaurants.map((restaurant) => ({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    text: restaurant.offer
  }));

  res.json(offers);
});

app.post('/api/cart/quote', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);
    return total + (price * quantity);
  }, 0);

  const deliveryFee = subtotal > 80 ? 0 : 5;
  const total = subtotal + deliveryFee;

  res.json({ subtotal, deliveryFee, total });
});

app.post('/api/orders', (req, res) => {
  const orderId = `FO-${Date.now()}`;
  res.status(201).json({
    id: orderId,
    status: 'created',
    estimatedDelivery: '35-45 min',
    payload: req.body || {}
  });
});

const webDir = path.join(__dirname, '../../web');
app.use(express.static(webDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('API running on '+PORT));
