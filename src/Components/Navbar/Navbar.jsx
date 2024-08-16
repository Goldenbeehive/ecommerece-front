import React, { Component } from 'react';
import './Navbar.css';
import logo from '../../assets/a-logo.svg';
import cart from '../../assets/cart.svg';
import menu from '../../assets/menu.svg';

class Navbar extends Component {
  handleCategoryClick = (category) => {
    const { handleCategoryClick, back } = this.props;
    handleCategoryClick(category);
    
  
    const newUrl = `/${category.toLowerCase()}`;
    window.history.pushState({}, '', newUrl);
    
    back();  
  }

  render() {
    const {
      dimstate,
      selectedCategory,
      sidebar,
      dimpage,
      shoppingCartNum,
      toggleSidebar,
    } = this.props;

    return (
      <>
        <nav>
          {sidebar ? ['ALL', 'CLOTHES', 'TECH'].map((category) => (
            <a 
              href={`/${category.toLowerCase()}`} 
              data-testid={selectedCategory === category ? 'active-category-link' : 'category-link'} 
              className="nav-cat-mobile" 
              key={category} 
              onClick={(e) => { 
                e.preventDefault();  
                this.handleCategoryClick(category);  
              }}
            >
              <p className={selectedCategory === category ? 'cat-link-selected' : 'cat-link-unselected'}>
                {category}
              </p>
              <div className={selectedCategory === category ? 'line-viz' : 'line-inv'}></div>
            </a>
          )) : <></>}
          <div id='top-nav'>
            <div id='left'>
              <div onClick={toggleSidebar} id='mobile-left'>
                <img src={menu} alt="menu"></img>
              </div>
              <div id='fullscreen-left'>
                {['ALL', 'CLOTHES', 'TECH'].map((category) => (
                  <a 
                    href={`/${category.toLowerCase()}`} 
                    data-testid={selectedCategory === category ? 'active-category-link' : 'category-link'} 
                    className="nav-cat" 
                    key={category} 
                    onClick={(e) => { 
                      e.preventDefault();  
                      this.handleCategoryClick(category);  
                    }}
                  >
                    <p className={selectedCategory === category ? 'cat-link-selected' : 'cat-link-unselected'}>
                      {category}
                    </p>
                    <div className={selectedCategory === category ? 'line-viz' : 'line-inv'}></div>
                  </a>
                ))}
              </div>
            </div>
            <div id='center'>
              <img src={logo} alt="logo"></img>
            </div>
            <div id='right'>
              <div></div>
              <div></div>
              <div>
                <img 
                  data-testid='cart-btn' 
                  onClick={() => { dimpage();}} 
                  id='cart-icon' 
                  src={cart} 
                  alt="cart"
                ></img>
                {shoppingCartNum !== 0 ? <span data-testid="cart-count-bubble" id="badge">{shoppingCartNum}</span> : <div></div>}
              </div>
              <div></div>
            </div>
          </div>
        </nav>
      </>
    );
  }
}

export default Navbar;
