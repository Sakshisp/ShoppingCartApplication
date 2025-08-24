package com.example.cart.pricing;

public interface Offer {
    /** How many items are chargeable given a raw count. */
    int chargeableQuantity(int count);
}
