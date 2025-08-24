package com.example.cart.model;

public record CartLine(
        String item,          // "Apple"
        int qty,              // 4
        int chargeableQty,    // 3 (if 3-for-2)
        int unitPricePence,   // 35
        int lineTotalPence    // 105
) {}
