#!/usr/bin/env node
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

const frontendHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BuyWhere — Compare prices, save money</title>
  <meta name="description" content="BuyWhere helps you compare product prices across thousands of stores. Find the best deals and save money on your purchases.">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#1e1b4b;background:#f8fafc;line-height:1.6}
    .container{max-width:1200px;margin:0 auto;padding:0 24px}
    .header{background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:100}
    .header-inner{display:flex;align-items:center;justify-content:space-between;height:64px}
    .logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:20px;font-weight:700;color:#1e1b4b}
    .logo svg{flex-shrink:0}
    .nav{display:flex;gap:8px}
    .nav-link{text-decoration:none;color:#64748b;font-size:14px;font-weight:500;padding:8px 16px;border-radius:8px;transition:all .2s}
    .nav-link:hover{color:#6366f1;background:#f1f5f9}
    .hero{padding:80px 0 64px;text-align:center;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%)}
    .hero-title{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;margin-bottom:16px}
    .hero-subtitle{font-size:1.125rem;color:#64748b;max-width:560px;margin:0 auto 32px}
    .search-form{display:flex;align-items:center;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:4px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)}
    .search-form:focus-within{border-color:#6366f1;box-shadow:0 4px 12px rgba(99,102,241,.15)}
    .search-icon{flex-shrink:0;margin-left:16px;color:#94a3b8}
    .search-input{flex:1;border:none;padding:14px 12px;font-size:1rem;font-family:inherit;outline:none;background:transparent;color:#1e1b4b}
    .search-input::placeholder{color:#94a3b8}
    .search-btn{background:#6366f1;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}
    .search-btn:hover{background:#4f46e5}
    .hero-trends{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;flex-wrap:wrap}
    .trend-label{font-size:13px;color:#94a3b8;font-weight:500}
    .trend-tag{text-decoration:none;font-size:13px;color:#6366f1;background:#eef2ff;padding:4px 12px;border-radius:20px;font-weight:500;transition:background .2s}
    .trend-tag:hover{background:#e0e7ff}
    .features{padding:80px 0}
    .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
    .feature-card{background:#fff;padding:32px;border-radius:16px;border:1px solid #e2e8f0;transition:transform .2s,box-shadow .2s}
    .feature-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
    .feature-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:#fff}
    .fic1{background:linear-gradient(135deg,#6366f1,#8b5cf6)}
    .fic2{background:linear-gradient(135deg,#f97316,#ef4444)}
    .fic3{background:linear-gradient(135deg,#10b981,#059669)}
    .feature-card h3{font-size:18px;font-weight:600;color:#1e1b4b;margin-bottom:8px}
    .feature-card p{font-size:14px;color:#64748b;line-height:1.7}
    .deals{padding:80px 0;background:#fff}
    .section-title{font-size:28px;font-weight:700;color:#1e1b4b;text-align:center;margin-bottom:8px}
    .section-desc{text-align:center;color:#64748b;margin-bottom:40px;font-size:15px}
    .deals-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
    .deal-card{border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;transition:transform .2s,box-shadow .2s;background:#fff;position:relative}
    .deal-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
    .deal-badge{position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:6px}
    .deal-img{height:180px}
    .deal-info{padding:20px}
    .deal-info h4{font-size:16px;font-weight:600;color:#1e1b4b;margin-bottom:12px}
    .deal-price{display:flex;align-items:center;gap:8px;margin-bottom:4px}
    .price-original{font-size:14px;color:#94a3b8;text-decoration:line-through}
    .price-current{font-size:20px;font-weight:700;color:#6366f1}
    .deal-store{font-size:13px;color:#64748b}
    .cta{padding:80px 0;text-align:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
    .cta h2{font-size:32px;font-weight:700;margin-bottom:12px}
    .cta p{font-size:16px;opacity:.9;margin-bottom:32px}
    .cta-btn{display:inline-block;background:#fff;color:#6366f1;font-weight:600;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;transition:transform .2s,box-shadow .2s}
    .cta-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
    .footer{background:#1e1b4b;color:#c7d2fe;padding:64px 0 0}
    .footer-inner{display:grid;grid-template-columns:2fr 3fr;gap:48px;padding-bottom:48px}
    .footer-brand .logo{color:#fff;margin-bottom:16px}
    .footer-brand p{font-size:14px;line-height:1.7;max-width:300px}
    .footer-links{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
    .footer-col h4{color:#fff;font-size:14px;font-weight:600;margin-bottom:16px}
    .footer-col a{display:block;color:#c7d2fe;text-decoration:none;font-size:14px;margin-bottom:8px;transition:color .2s}
    .footer-col a:hover{color:#fff}
    .footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding:24px 0;font-size:13px;color:#a5b4fc}
    @media(max-width:768px){.nav{display:none}.footer-inner{grid-template-columns:1fr}.footer-links{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <a href="/" class="logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#6366f1"/><path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#fff" opacity="0.9"/><path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#6366f1"/><path d="M20 10l4-2m-4 14l4 2M10 10l-4-2m4 14l-4 2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>BuyWhere</span>
      </a>
      <nav class="nav">
        <a href="#deals" class="nav-link">Deals</a>
        <a href="#categories" class="nav-link">Categories</a>
        <a href="#compare" class="nav-link">Compare</a>
        <a href="#about" class="nav-link">About</a>
      </nav>
    </div>
  </header>
  <section class="hero">
    <div class="container">
      <h1 class="hero-title">Find the best price.<br>Anywhere.</h1>
      <p class="hero-subtitle">Compare millions of products across thousands of stores worldwide. Get the best deal, every time.</p>
      <form class="search-form" id="searchForm" action="/" method="get">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" class="search-input" id="searchInput" placeholder="Search products, brands, or categories..." aria-label="Search products">
        <button type="submit" class="search-btn">Search</button>
      </form>
      <div class="hero-trends"><span class="trend-label">Trending:</span><a href="#" class="trend-tag">Gaming Laptops</a><a href="#" class="trend-tag">Wireless Earbuds</a><a href="#" class="trend-tag">Smart Home</a><a href="#" class="trend-tag">Fitness Trackers</a></div>
    </div>
  </section>
  <section class="features">
    <div class="container">
      <div class="features-grid">
        <div class="feature-card"><div class="feature-icon fic1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m16 3 4 4-4 4M8 21l-4-4 4-4"/><path d="M20 7H4M4 17h16"/></svg></div><h3>Compare Prices</h3><p>See prices from hundreds of stores side-by-side and find the absolute best deal.</p></div>
        <div class="feature-card"><div class="feature-icon fic2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/></svg></div><h3>Top Deals</h3><p>Discover the hottest deals and limited-time offers curated just for you.</p></div>
        <div class="feature-card"><div class="feature-icon fic3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/><path d="M8 12h8M12 8v8"/></svg></div><h3>Price Alerts</h3><p>Set price alerts and get notified when your favorite items go on sale.</p></div>
      </div>
    </div>
  </section>
  <section class="deals" id="deals">
    <div class="container">
      <h2 class="section-title">Hot Deals</h2>
      <p class="section-desc">Limited-time offers you won't want to miss</p>
      <div class="deals-grid" id="dealsGrid">
        <div class="deal-card"><div class="deal-badge">-40%</div><div class="deal-img" style="background:linear-gradient(135deg,#667eea,#764ba2)"></div><div class="deal-info"><h4>Wireless Noise-Cancelling Headphones</h4><div class="deal-price"><span class="price-original">$299</span><span class="price-current">$179</span></div><p class="deal-store">Amazon</p></div></div>
        <div class="deal-card"><div class="deal-badge">-25%</div><div class="deal-img" style="background:linear-gradient(135deg,#f093fb,#f5576c)"></div><div class="deal-info"><h4>Smart Watch Pro Series</h4><div class="deal-price"><span class="price-original">$399</span><span class="price-current">$299</span></div><p class="deal-store">Best Buy</p></div></div>
        <div class="deal-card"><div class="deal-badge">-30%</div><div class="deal-img" style="background:linear-gradient(135deg,#4facfe,#00f2fe)"></div><div class="deal-info"><h4>Portable Bluetooth Speaker</h4><div class="deal-price"><span class="price-original">$149</span><span class="price-current">$104</span></div><p class="deal-store">Walmart</p></div></div>
      </div>
    </div>
  </section>
  <section class="cta" id="compare">
    <div class="container">
      <h2>Ready to save money?</h2>
      <p>Join millions of smart shoppers who compare prices with BuyWhere.</p>
      <a href="#" class="cta-btn">Start Comparing &rarr;</a>
    </div>
  </section>
  <footer class="footer" id="about">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="logo"><svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#6366f1"/><path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#fff" opacity="0.9"/><path d="M12 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="#6366f1"/></svg><span>BuyWhere</span></div><p>Compare prices across thousands of stores. Save on every purchase.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col"><h4>Product</h4><a href="#">Deals</a><a href="#">Categories</a><a href="#">Price Alerts</a><a href="#">Compare</a></div>
        <div class="footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a></div>
        <div class="footer-col"><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
      </div>
    </div>
    <div class="container footer-bottom"><p>&copy; 2026 BuyWhere. All rights reserved.</p></div>
  </footer>
  <script>
    document.addEventListener('DOMContentLoaded',()=>{
      const f=document.getElementById('searchForm');
      const i=document.getElementById('searchInput');
      if(f){f.addEventListener('submit',function(e){e.preventDefault();const q=i.value.trim();if(q){i.value='';alert('Searching for "'+q+'"... This feature is coming soon!')}})}
    });
  </script>
</body>
</html>`;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'buywhere-frontend',
    content: 'BuyWhere frontend application is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8').send(frontendHtml);
});

const server = app.listen(PORT, () => {
  console.log(`✅ BuyWhere Frontend Server running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });

module.exports = { app, server };
