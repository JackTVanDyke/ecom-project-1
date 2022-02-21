//vars
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartNumItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// const bannerBtn = document.querySelector(".banner-btn");
//button function boy

//main cart, starts empty
let cart = [];

//buttons
let btnsDOM = [];
//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class DisplayProducts {
  displayProductsUI(products) {
    let result = "";
    products.forEach((product) => {
      result += `
    <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="" class="product-img" />
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Add To Cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    btnsDOM = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartNumItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
     <img src="${item.image}" alt="Product" />
          <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cart = cart.filter((item) => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
          Storage.saveCart(cart);
          this.setCartValue(cart);
        } else {
          cart = cart.filter((item) => item.id !== id);
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.setCartValue(cart);
          Storage.saveCart(cart);
        }
      }
    });
  }
  clearCart() {
    cart = [];
    this.setCartValue(cart);
    Storage.saveCart(cart);
    const btns = [...document.querySelectorAll(".bag-btn")];
    btns.forEach((btn) => {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To Bag`;
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const displayProducts = new DisplayProducts();
  const products = new Products();
  //setup
  displayProducts.setupAPP();

  //get products
  products
    .getProducts()
    .then((products) => {
      displayProducts.displayProductsUI(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      displayProducts.getBagButtons();
      displayProducts.cartLogic();
    });
});

function checkBagButtons() {
  const btns = [...document.querySelectorAll(".bag-btn")];
  btnsDOM = btns;
  btns.forEach((btn) => {
    let id = btn.dataset.id;
    let inCart = cart.find((item) => item.id === id);
    if (inCart) {
      btn.innerText = "In Cart";
      btn.disabled = true;
    } else {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To Cart`;
    }
  });
}
setInterval(checkBagButtons, 1000);
