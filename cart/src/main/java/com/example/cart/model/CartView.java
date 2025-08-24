package com.example.cart.model;

import java.util.List;

public record CartView(
        List<String> cart,
        int count
) {}
