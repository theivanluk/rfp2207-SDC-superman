import React, { useReducer, useEffect, createContext, useState } from 'react';
import axios from 'axios';

import ImageGallery from './ImageGallery/ImageGallery.jsx';
import ProductDetails from './ProductDetails/ProductDetails.jsx';

const _AtelierAPI = 'https://app-hrsei-api.herokuapp.com/api/fec2/rfp/';
const initialeState = { productStyles: [], productDetails: {}, selectedStyle: {}, productRating: {} }

const AtelierGetProductEndpoint = (endpoint = '') => {
  return axios({
    url: _AtelierAPI + "products/" + endpoint,
    method: 'get',
    headers: {"Authorization": process.env.KEY}
  })
}

const AtelierGetReviewEndpoint = (productID = 0) => {
  return axios({
    url: _AtelierAPI + 'reviews/meta',
    method: 'get',
    headers: { "Authorization": process.env.KEY },
    params: { product_id: Number(productID) }
  })
  // return axios.get(_AtelierAPI + 'reviews/meta', {
  //   params: { product_id: productID }
  // },
  //   headers: {"Authorization": process.env.KEY}
  // )
}

function FindDefaultStyle (styles) {
  let defaultStyle = styles.filter((style) => style['default?'] === true);
  return defaultStyle.length === 1 ? defaultStyle[0] : styles[0];
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'selectStyle':
      return { ...state, selectedStyle: action.selectStyle }
    case 'setAll':
      return {
        selectedStyle: action.selectedStyle,
        productDetails: action.setDetails,
        productStyles: action.setStyles,
        productRating: action.setRating }
    default:
      return { state }
  }
}

export const ProductContext = createContext();

const Overview = (props) => {

  const [state, dispatch] = useReducer(reducer, initialeState)

  const GetProductData = (productID) => {
    return axios.all([
      AtelierGetProductEndpoint(productID),
      AtelierGetProductEndpoint(productID + '/styles'),
      AtelierGetReviewEndpoint(productID)
    ])
    .then((responses) => {
      dispatch({
        type: 'setAll',
        setDetails: responses[0].data,
        setStyles: responses[1].data,
        selectedStyle: FindDefaultStyle(responses[1].data.results),
        setRating: responses[2].data.ratings
      })
    })
    .catch((err) => console.log(err));
  }

  useEffect(() => {
    GetProductData(props.id)
  }, [])



  return (
    <ProductContext.Provider value={{state, dispatch}}>
      <div className = "overview">
        <ImageGallery productStyle = {state.selectedStyle}/>
        <ProductDetails productDetails = {state.productDetails}/>
      </div>
    </ProductContext.Provider>
  )
}

export default Overview