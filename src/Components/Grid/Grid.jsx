import { Component } from "react";
import './Grid.css'
import cart from "../../assets/cart.svg"
import axios from "axios";
class Card extends Component {
    state = {
        incart: false,
        cachedData: null,
    };

    handleAddToCart = () => {
        const { id, title, price, instock, attributes, addToCart } = this.props;

      
            const product = {
                id,
                name: title,
                inStock: instock,
                description: "<p>Description for the product</p>", 
                gallery: [{ id: "1", product_id: id, image_url: this.props.img }],  
                prices: [{ id: "1", product_id: id, amount: price, currency: "USD" }],
                attributes,  
                brand: "Your Brand Name",  
            };

            
            const selectedAttributes = {};
           
            attributes.forEach(attr => {
                const items = JSON.parse(attr.items);  
                if (items.length > 0) {
                    selectedAttributes[attr.name] = items[0];  
                }
            });
          
            addToCart(product, selectedAttributes);
       
    };

    render() {
        const {
            title,
            price,
            instock,
            img,
            id,
            setMainPage,
            setId,
        } = this.props;
 
        return (
            <div
                onMouseEnter={() => this.setState({ incart: true })}
                onMouseLeave={() => this.setState({ incart: false })}
                data-testid={`product-${title.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => { setId(id); setMainPage(false); }}
                className="card"
            >
                {this.state.incart && instock && (
                    <div onClick={(e)=>{ e.stopPropagation();this.handleAddToCart()}} className="incart">
                        <img src={cart} alt="Cart icon" />
                    </div>
                )}
                <div>
                    <div className={instock ? "" : "outOfStock"}>
                        {instock ? "" : "OUT OF STOCK"}
                    </div>
                    <img className="cardimg" src={img} alt={title} />
                </div>
                <p className="lighttext">{title}</p>
                <p>${Number.parseFloat(price).toFixed(2)}</p>
            </div>
        );
    }
}
class CardSkelly extends Component {
    render() {
        const {
            title,
            price,
            incart,
            setMainPage,
        } = this.props
        return (
            <div
                className="card">
                {
                    incart &&
                    <div className="incart">
                        <img src={cart}></img>
                    </div>
                }
                <div id="cardskelly"></div>
                <div id="textskelly"></div>
                <div id="textskelly"></div>
            </div>
        );
    }
}

class Grid extends Component {
    
    state = {
        loading: true,
        data: [],
        attributes: {}
    };

    componentDidMount() {
        this.fetchProducts();
    }
    getCachedData = () => {
        const cachedData = sessionStorage.getItem('cachedData');
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        return null;
    };
    fetchProducts = () => {
        const cachedData = this.getCachedData();
        const endpoint = "https://site-production-c6ed.up.railway.app/index.php";
        const headers = {
            "content-type": "application/json",
            "Authorization": "<token>"
        };
        const graphqlQuery = {
            operationName: "fetch",
            query: `query AllProducts {
                allProducts {
                    name
                    inStock
                    id
                    category_id
                    prices {
                        amount
                        currency
                    }
                    gallery {
                        id
                        product_id
                        image_url
                    }
                    attributes {
                        id
                        name
                        items
                    }
                }
            }`,
            variables: {}
        };

        axios.post(endpoint, graphqlQuery, { headers })
        .then(({ data }) => {
            const products = data.data.allProducts;
            this.setState({
                loading: false,
                data: products,
                attributes: products.reduce((acc, product) => {
                    acc[product.id] = product.attributes || [];
                    return acc;
                }, {}),
            });
            // Cache the data in the session storage
            sessionStorage.setItem('cachedData', JSON.stringify({
                data: products,
                attributes: products.reduce((acc, product) => {
                    acc[product.id] = product.attributes || [];
                    return acc;
                }, {}),
            }));
        });
    };

    render() {
        const { selectedCategory, setMainPage, setId, addToCart } = this.props;
        let filter;
        switch (selectedCategory) {
            case "All":
                filter = 1;
                break;
            case "CLOTHES":
                filter = 2;
                break;
            case "TECH":
                filter = 3;
                break;
            default:
                filter = 1;  
                break;
        }
 
        return (
            <>
                <p id='title'>{selectedCategory}</p>
                <div className="grid-container">
                    {this.state.loading ? ( 
                        Array.from({ length: 9 }).map((_, index) => (
                            <CardSkelly key={index} />
                        ))
                    ) : (
                        this.state.data.map((val) =>
                            (val.category_id === filter || filter === 1) ? (
                                <Card
                                    key={val.id}
                                    setId={setId}
                                    id={val.id}
                                    instock={val.inStock}
                                    setMainPage={setMainPage}
                                    title={val.name}
                                    price={val.prices[0].amount}
                                    img={val.gallery[0].image_url}
                                    attributes={val.attributes}  
                                    addToCart={addToCart}  
                                />
                            ) : null
                        )
                    )}
                </div>
            </>
        );
    }
}
export default Grid