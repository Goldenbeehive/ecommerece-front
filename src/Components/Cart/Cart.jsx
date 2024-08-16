import React, { Component } from "react";
import './Cart.css';
import { shortenSize } from "../util";

class Cart extends Component {
    render() {
        const { cartItems, updateQuantity, removeItem ,isPlacingOrder} = this.props;
        const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        const itemText = itemCount === 1 ? 'item' : 'items';
        return (
            <div id="cart">
                <div id="cart-title">
                    <p id="bold">My Bag,</p> {itemCount} {itemText}
                </div>
                <div style={isPlacingOrder?{pointerEvents: 'none'}:{}} id="cart-list">
                    {cartItems.map((item, index) => (
                        <Item
                            key={index}
                            item={item}
                            isPlacingOrder={isPlacingOrder}
                            updateQuantity={(change) => updateQuantity(index, change)}
                            removeItem={() => removeItem(index)}
                        />
                    ))}
                </div>
      
            </div>
        );
    }
}

class Item extends Component {
    render() {
        const { item, updateQuantity, removeItem} = this.props;
        const { product, selectedAttributes, quantity } = item;
   
        return (
            <div  id="item-flex">
                <div id="item-left">
                    <div id="item-title">{product.name}</div>
                    <div>${Number.parseFloat(product.prices[0].amount).toFixed(2)}</div>
                    {product.attributes.map((attribute) => {
                        const items = JSON.parse(attribute.items);
                        const attributeNameKebabCase = attribute.name.toLowerCase().replace(/\s+/g, '-');
                        const selectedValue = selectedAttributes[attribute.name].value;
                        return (
                            <div key={attribute.id} data-testid={`cart-item-attribute-${attributeNameKebabCase}`}>
                                <div>{attribute.name}:</div>
                                <div id='flex-row-size'>
                                    {items.map((item) => {
                                        const itemValueKebabCase = item.id.replace(/\s+/g, '-');
                                        const isSelected = selectedValue === item.value;
                                        return (
                                            <div
                                                key={item.id}
                                                className={isSelected ?
                                                    (attribute.name === "Color" ? "cart-color-chosen" : "cart-size-chosen") :
                                                    (attribute.name === "Color" ? "cart-color-box" : "cart-size-box")}
                                                style={attribute.name === "Color" ? { backgroundColor: item.value } : {}}
                                                data-testid={`cart-item-attribute-${attributeNameKebabCase}-${itemValueKebabCase}${isSelected ? '-selected' : ''}`}
                                            >
                                                {attribute.name === "Size"
                                                    ? shortenSize(item.displayValue)
                                                    : (attribute.name !== "Color" && item.displayValue)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {
                        product.attributes.length === 0 &&
                        <>
                            <div id='flex-row-size-cart'></div>
                        </>
                    }
                </div>
                <div id="item-right">
                    <div id="amount-flex">
                        <div id="block" onClick={() => updateQuantity(1)} data-testid="cart-item-amount-increase">+</div>
                        <div data-testid="cart-item-amount">{quantity}</div>
                        <div id="block" onClick={() => quantity > 1 ? updateQuantity(-1) : removeItem()} data-testid="cart-item-amount-decrease">-</div>
                    </div>
                    <img className='item-img' src={product.gallery ? product.gallery[0].image_url : ''} alt={product.name}></img>
                </div>
            </div>
        );
    }
}


export default Cart;