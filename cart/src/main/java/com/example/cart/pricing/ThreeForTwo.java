package com.example.cart.pricing;

public class ThreeForTwo implements Offer {
    @Override public int chargeableQuantity(int count) {
        return count - (count / 3);
    }
}
