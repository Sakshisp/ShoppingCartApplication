package com.example.cart.pricing.offers;

public class BuyOneGetOneFree implements Offer {
    @Override public int chargeableQuantity(int count) {
        return (count / 2) + (count % 2); // ceil(count/2)
    }
}
