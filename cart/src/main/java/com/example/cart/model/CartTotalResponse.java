package com.example.cart.model;

import com.example.cart.util.MoneyUtil;

import java.util.List;

public record CartTotalResponse(
        String currency,      // "GBP"
        int totalPence,       // 235
        String totalFormatted,// "£2.35"
        List<CartLine> lines
) {
    public static CartTotalResponse ofPence(String currency, int totalPence, List<CartLine> lines) {
        return new CartTotalResponse(currency, totalPence, MoneyUtil.formatGBP(totalPence), List.copyOf(lines));
    }
}
