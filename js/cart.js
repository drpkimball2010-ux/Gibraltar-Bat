(function () {
  const KEY = 'gibraltar-cart';
  var checkoutBtn = null;
  var termsCheck  = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (_) { return []; }
  }

  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function updateCheckoutBtn() {
    if (!checkoutBtn) return;
    var cart = load();
    var ready = cart.length > 0 && termsCheck && termsCheck.checked;
    if (ready) {
      checkoutBtn.classList.remove('disabled');
    } else {
      checkoutBtn.classList.add('disabled');
    }
  }

  function add(name, price) {
    const cart = load();
    cart.push({ name, price: Number(price) });
    save(cart);
    render();
    openPanel();
  }

  function remove(i) {
    const cart = load();
    cart.splice(i, 1);
    save(cart);
    render();
  }

  function openPanel() {
    document.getElementById('cart-panel').classList.add('open');
  }

  function togglePanel() {
    document.getElementById('cart-panel').classList.toggle('open');
  }

  function render() {
    const cart  = load();
    const items = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const sub   = document.getElementById('cart-subtotal');

    if (!items) return;

    count.textContent = cart.length || '';
    count.style.display = cart.length ? 'flex' : 'none';

    if (cart.length === 0) {
      items.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      items.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price}</span>
          <button class="cart-item-remove" data-i="${i}">&times;</button>
        </div>
      `).join('');

      items.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          remove(Number(btn.dataset.i));
        });
      });
    }

    const total = cart.reduce((s, item) => s + item.price, 0);
    sub.textContent = '$' + total;

    updateCheckoutBtn();
  }

  window.GibraltarCart = { add: add };

  document.addEventListener('DOMContentLoaded', function () {
    // Inject T&C checkbox into cart footer
    var cartFooter = document.querySelector('.cart-footer');
    if (cartFooter) {
      checkoutBtn = cartFooter.querySelector('.btn-checkout');
      if (checkoutBtn) {
        var termsDiv = document.createElement('div');
        termsDiv.className = 'cart-terms';
        termsDiv.innerHTML = '<label><input type="checkbox" id="cart-terms-agree" /> I agree to the <a href="terms.html" target="_blank">Terms &amp; Conditions</a></label>';
        cartFooter.insertBefore(termsDiv, checkoutBtn);
        termsCheck = document.getElementById('cart-terms-agree');
        termsCheck.addEventListener('change', updateCheckoutBtn);
      }
    }

    render();

    var toggle = document.getElementById('cart-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
    });

    document.addEventListener('click', function (e) {
      var panel = document.getElementById('cart-panel');
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    // Hamburger menu
    var hamburger = document.getElementById('nav-hamburger');
    var navLinks  = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
      navLinks.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    }

    document.querySelectorAll('[data-add-cart]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        add(btn.dataset.name, btn.dataset.price);
      });
    });
  });
})();
