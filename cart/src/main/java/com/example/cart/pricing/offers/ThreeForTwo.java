package com.example.cart.pricing.offers;

public class ThreeForTwo implements Offer {
    @Override public int chargeableQuantity(int count) {
        return count - (count / 3);
    }
}
