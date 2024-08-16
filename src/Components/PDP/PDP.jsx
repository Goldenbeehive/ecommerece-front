import React, { Component } from 'react';
import './PDP.css';
import axios from 'axios';
import parse from 'html-react-parser';
import { shortenSize } from '../util';

class PDP extends Component {
    state = {
        imgArr: [],
        sizeIndex: 0,
        colorIndex: 0,
        imgArrIndex: 0,
        data: {},
        items: [],
        selectedAttributes: {},
        loading: true,
    };

    handleimgClick = (num) => {
        this.setState(() => ({
            imgArrIndex: num
        }));
    };

    isValidColor = (color) => {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    };

    handleLeftClick = () => {
        this.setState((prevState) => ({
            imgArrIndex: (prevState.imgArrIndex - 1 + prevState.imgArr.length) % prevState.imgArr.length
        }));
    };

    handleRightClick = () => {
        this.setState((prevState) => ({
            imgArrIndex: (prevState.imgArrIndex + 1) % prevState.imgArr.length
        }));
    };

    componentDidMount() {
        const { id } = this.props;
        const endpoint = "https://site-production-c6ed.up.railway.app/index.php";
        const headers = {
            "content-type": "application/json",
            "Authorization": "<token>"
        };
        const graphqlQuery = {
            operationName: "fetch",
            query: `query GalleryOfProduct {
                galleryOfProduct(id: "${id}") {
                    id
                    product_id
                    image_url
                }
                pricesOfProduct(id: "${id}") {
                    id
                    product_id
                    amount
                    currency
                }
                AttributesOfProduct(id: "${id}") {
                    id
                    product_id
                    name
                    type
                    items
                }
                Product(id: "${id}") {
                    id
                    name
                    inStock
                    description
                     gallery {
            id
            product_id
            image_url
        }
                     prices {
            id
            product_id
            amount
            currency
        }
             attributes {
            id
            product_id
            name
            type
            items
        }
                    brand
                }
            }`,
            variables: {}
        };

        axios.post(endpoint, graphqlQuery, { headers })
            .then(({ data }) => {
                const attributes = data.data.AttributesOfProduct;
                const items = attributes.length ? attributes : [];
                const attributeName = attributes.length ? attributes[0].name : '';

                this.setState({
                    data: data.data,
                    imgArr: data.data.galleryOfProduct,
                    items: items,
                    attributeName: attributeName,
                    loading: false
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                this.setState({ loading: false });
            });
    }

    areAllItemsSelected = () => {
        if(this.state.items.length == 0){
            return true
        }
        return this.state.items.length > 0 &&
            this.state.items.every(attribute =>
                this.state.selectedAttributes[attribute.name] !== undefined
            );
    };
    handleAddToCart = () => {
        if (this.areAllItemsSelected()) {
            const { data, selectedAttributes } = this.state;
          
            this.props.addToCart(data.Product, selectedAttributes);
        }
    };
    handleAttributeSelection = (attributeName, item) => {
        this.setState(prevState => ({
            selectedAttributes: {
                ...prevState.selectedAttributes,
                [attributeName]: item
            }
        }));
    };

    render() {
        const { back, price, dimpage } = this.props;
        const { imgArr, imgArrIndex, attributeName, data, items, loading} = this.state;
        if (loading) {
            return (
                <div id='pdp-anim'>
                    <button id="back-button" onClick={() => { back() }}>
                        ←
                    </button>
                    <div id="pdp-container">
                        <div id="pdp-left">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="skeleton inner-img-list"></div>
                            ))}
                        </div>
                        <div id='pdp-center'>
                            <div id="center-img-div">
                                <div id="center-img" className="skeleton"></div>
                            </div>
                        </div>
                        <div id="pdp-right">
                            <div id='right-margin'>
                                <div id="pdp-title" className="skeleton" style={{ width: '200px', height: '30px' }}></div>
                                <div id='pdp-size' className="skeleton" style={{ width: '100px', height: '20px', marginTop: '25px' }}></div>
                                <div id='flex-row-size'>
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index} className="skeleton"></div>
                                    ))}
                                </div>
                                <div className="skeleton" style={{ marginTop: '20px', height: '45px' }}></div>
                                <div id="desc" className="skeleton" style={{ height: '100px', marginTop: '25px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
 

        return (
            <div id='pdp-anim'>
                <button id="back-button" onClick={() => { back() }}>
                    ←
                </button>
                <div id="pdp-container">
                    <div data-testid='product-gallery' id="pdp-left">
                        {imgArr.map((elem, index) => (
                            <img key={index} onClick={() => this.handleimgClick(index)} className="inner-img-list" src={elem.image_url} alt={`product-${index}`} />
                        ))}
                    </div>
                    <div id='pdp-center'>
                        <div id="center-img-div">
                            <img id="center-img" src={imgArr[imgArrIndex].image_url} alt={`product-main`} />
                            <button id="img-left-button" onClick={this.handleLeftClick}>
                                ←
                            </button>
                            <button id="img-right-button" onClick={this.handleRightClick}>
                                →
                            </button>
                        </div>
                    </div>
                    <div id="pdp-right">
                        <div id='right-margin'>
                            <p id="pdp-title">{data.Product.name}</p>
                            {items.map((attribute, index) => {
                                let choices = JSON.parse(attribute.items);
                                return (
                                    <div data-testid={`product-attribute-${attribute.name.toLowerCase()}`} key={index}>
                                        <p id='pdp-size'>{attribute.name}:</p>
                                        <div id='flex-row-size'>
                                            {choices.map((item, itemIndex) => (
                                                <div
                                                data-testid={`product-attribute-${attribute.name.toLowerCase()}-${item.displayValue}`}
                                                    key={itemIndex}
                                                    onClick={() => this.handleAttributeSelection(attribute.name, item)}
                                                    style={{ backgroundColor: this.isValidColor(item.displayValue) ? item.displayValue : '' }}
                                                    className={`
                                                        ${this.isValidColor(item.displayValue) ? 'item-box-color' : 'item-box'}
                                                        ${this.state.selectedAttributes[attribute.name] && this.state.selectedAttributes[attribute.name].id === item.id ?
                                                            (this.isValidColor(item.displayValue) ? 'item-chosen-color' : 'item-chosen')
                                                            : ''}
                                                    `}
                                                >
                                                    {this.isValidColor(item.displayValue)
                                                        ? ""
                                                        : (attribute.name === "Size"
                                                            ? shortenSize(item.displayValue)
                                                            : item.displayValue)
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            <div id='pdp-size'>
                                Price:
                            </div>
                            <div id='pdp-size' style={{marginTop:"0px"}} >
                                {data.pricesOfProduct.currency == "USD" ? "$" : ""}{data.pricesOfProduct.amount}
                            </div>
                            <button data-testid='add-to-cart'
                                onClick={()=>{this.handleAddToCart();dimpage();}}
                                id={this.state.data.Product.inStock ?
                                    (this.areAllItemsSelected() ? "add-cart" : "add-cart-inactive")
                                    : 'not-instock'}
                                disabled={!this.state.data.Product.inStock || !this.areAllItemsSelected()}
                            >
                                ADD TO CART
                            </button>
                            <div data-testid='product-description' id="desc">{parse(data.Product.description)}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PDP;