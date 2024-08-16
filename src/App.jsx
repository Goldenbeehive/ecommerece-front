import React, { Component } from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar.jsx';
import Grid from './Components/Grid/Grid.jsx';
import PDP from './Components/PDP/PDP.jsx';
import Cart from './Components/Cart/Cart.jsx';
import axios from 'axios';

class App extends Component {
  /**
       * @type {Object}
       * @property {string} selectedCategory - The currently selected category.
       * @property {boolean} sidebar - Flag indicating whether the sidebar is open or closed.
       * @property {number} shoppingCartNum - The number of items in the shopping cart.
       * @property {boolean} showScrollTopButton - Flag indicating whether to show the scroll top button.
       */

  state = {
    selectedCategory: 'ALL',
    sidebar: false,
    shoppingCartNum: 0,
    showScrollTopButton: false,
    dimpage: false,
    mainpage: true,
    endAnimMainPage: false,
    iconPage: false,
    id: "",
    cartItems: [],
    isPlacingOrder: false,
  };
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);

  }
  setId = (idname) => {
    this.setState({
      id: idname
    });
  }
  BackToMainPage = () => {
    this.setState({
      showScrollTopButton: false,
      dimpage: false,
      mainpage: true,
      endAnimMainPage: false,
      iconPage: false,
    });
  }
  updateCartItemQuantity = (index, change) => {
    this.setState(prevState => {

      const updatedCartItems = [...prevState.cartItems];
      updatedCartItems[index].quantity += change;
      return { cartItems: updatedCartItems };
    });
  };
  placeOrder = () => {
    this.setState({isPlacingOrder: true });
    if (this.state.cartItems.length === 0) {
      return;
    }
    const endpoint = "https://site-production-c6ed.up.railway.app/index.php";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "<token>"
    };
 
    const escapeJSON = (json) => {
      return json.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    };
 
    const isEmpty = (obj) => Object.keys(obj).length === 0;
 
    // Dynamically build the GraphQL mutation string
    const cartItemsString = this.state.cartItems.map(item => `
      {
        product: {
          id: "${item.product.id}",
        },
        selectedAttributes: "${isEmpty(item.selectedAttributes) ? '{}' : escapeJSON(JSON.stringify(item.selectedAttributes))}",
        quantity: ${item.quantity}
      }
    `).join(', ');
 
    const graphqlQuery = {
      operationName: "placeOrder",
      query: `
        mutation {
          addToCart(cart: [${cartItemsString}]) {
            success,
            message,
            orderDetails {
              id,
              order_id,
              product_id,
              quantity,
              selected_attributes
            }
          }
        }
      `,
      variables: {}
    };
 
 
    axios.post(endpoint, graphqlQuery, { headers })
      .then(({ data }) => {
        this.setState({ cartItems: [], isPlacingOrder: false });
      })
      .catch(error => {
        this.setState({ isPlacingOrder: false });
      });
  };
  removeCartItem = (index) => {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.filter((_, i) => i !== index)
    }));
  };
  addToCart = (product, selectedAttributes) => {
    this.setState(prevState => {
    
        const existingItemIndex = prevState.cartItems.findIndex(item =>
            item.product.id === product.id &&
            JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
        );
        if (existingItemIndex !== -1) {
            const updatedCartItems = [...prevState.cartItems];
            updatedCartItems[existingItemIndex].quantity += 1;
            return { cartItems: updatedCartItems };
        } else {
         
            return {
                cartItems: [...prevState.cartItems, { product, selectedAttributes, quantity: 1 }],
            };
        }
    });
};

  /**
    * Handles scrolling event to show/hide the scroll top button.
    * @memberof App
    */
  handleScroll = () => {
    if (window.scrollY > 200) {
      this.setState({ showScrollTopButton: true });
    } else {
      this.setState({ showScrollTopButton: false });
    }
  };
  /**
   * Scrolls to the top of the page when the scroll top button is clicked.
   * @memberof App
   */
  scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  /**
    * Handles category click event.
    * @param {string} category - The category clicked.
    * @memberof App
    */
  handleCategoryClick = (category) => {
    this.setState({ selectedCategory: category });
  };
  /**
     * Toggles the sidebar.
     * @memberof App
     */
  toggleSidebar = () => {
    this.setState((prevState) => ({ sidebar: !prevState.sidebar }));
  };
  /**
    * Increments the shopping cart number.
    * @memberof App
    */
  incrementShoppingCartNum = () => {
    this.setState((prevState) => ({ shoppingCartNum: prevState.shoppingCartNum + 1 }));
  };

  setMainPage = (tf) => {
    this.setState((prevState) => ({ mainpage: tf }))
  }
  dimpage = () => {
    this.setState((prevState) => ({ dimpage: !prevState.dimpage }));
  }
  undimpage = () => {
    if (this.state.dimpage) {
      this.setState((prevState) => ({ dimpage: false }));
    }
  }
  endAnimMainPage = (event) => {
    if (event.animationName === "moveAndDisappear") {

      this.setState((prevState) => ({ endAnimMainPage: true, iconPage: true }));
    }
  }
  calculateTotal = () => {
    return this.state.cartItems.reduce((total, item) => total + item.product.prices[0].amount * item.quantity, 0).toFixed(2);
  }
  render() {
    return (
      <>
        <Navbar
          dimstate={this.state.dimpage}
          selectedCategory={this.state.selectedCategory}
          sidebar={this.state.sidebar}
          handleCategoryClick={this.handleCategoryClick}
          toggleSidebar={this.toggleSidebar}
          incrementShoppingCartNum={this.incrementShoppingCartNum}
          dimpage={this.dimpage}
          back={this.BackToMainPage}
          shoppingCartNum={this.state.cartItems.reduce((total, item) => total + item.quantity, 0)}
        />
        <div id={this.state.dimpage ? "shopping-flex" : "shopping-flex-hide"}>
          <div data-testid="cart-overlay" id={this.state.dimpage ? "shopping-list" : "shopping-list-close"}>
            <Cart
              isPlacingOrder={this.state.isPlacingOrder}
              cartItems={this.state.cartItems}
              updateQuantity={this.updateCartItemQuantity}
              removeItem={this.removeCartItem}
            />
          <div id='block-shopping'>
            <div data-testid='cart-total' id='total-row'>
              <div>Total</div>
              <div>$ {this.calculateTotal()}</div>
            </div>
            <button 
          onClick={this.placeOrder} 
          id={this.state.isPlacingOrder || this.state.cartItems.length === 0?"add-cart-inactive":"add-cart" }
          disabled={this.state.isPlacingOrder || this.state.cartItems.length === 0}
        >
          {this.state.isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
          </div>
          </div>
        </div>
        {
          !this.state.endAnimMainPage &&
          <div id={this.state.mainpage ? "mainpage-appear" : "mainpage-hide"} onAnimationEnd={(e) => this.endAnimMainPage(e)}>
            <div id={this.state.dimpage ? "dimmer" : ""} onClick={this.undimPage}>
              <Grid  addToCart={this.addToCart} setId={this.setId} setMainPage={this.setMainPage} selectedCategory={this.state.selectedCategory} />
              <button className={!this.state.showScrollTopButton ? 'scroll-top hide' : 'scroll-top '} onClick={this.scrollToTop}>
                ↑
              </button>
            </div>
          </div>
        }
        {
          this.state.iconPage &&
          <div id={this.state.dimpage ? "dimmer" : ""} onClick={this.undimPage}>
            <PDP
              id={this.state.id}
              back={this.BackToMainPage}
              price={50}
              addToCart={this.addToCart}
              dimpage={this.dimpage}
            />
          </div>
        }
      </>
    );
  }
}

export default App;
