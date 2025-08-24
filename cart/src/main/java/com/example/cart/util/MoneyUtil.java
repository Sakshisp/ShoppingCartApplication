package com.example.cart.util;

import java.text.NumberFormat;
import java.util.Locale;

public final class MoneyUtil {
    private MoneyUtil() {}
    public static String formatGBP(int pence) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.UK);
        return nf.format(pence / 100.0);
    }
}
