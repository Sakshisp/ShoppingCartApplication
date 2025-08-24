package com.example.cart.pricing;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

@Component
public class PriceCatalog {

    // All prices in pence TODO: move PRICES & Offers to .props to make it config based
    private static final Map<String, Integer> PRICES = Map.of(
            "apple", 35,
            "banana", 20,
            "melon", 50,
            "lime", 15
    );

    private static final Map<String, Offer> OFFERS = Map.of(
            "melon", new BuyOneGetOneFree(),
            "lime",  new ThreeForTwo()
            // apple/banana have no offers -> default
    );

    public int priceOf(String rawName) {
        Integer p = PRICES.get(normalize(rawName));
        if (p == null) throw new IllegalArgumentException("Unknown item: " + rawName);
        return p;
    }

    public Offer offerOf(String rawName) {
        return OFFERS.getOrDefault(normalize(rawName), count -> count); // default: pay all
    }

    public String canonical(String rawName) {
        String n = normalize(rawName);
        return switch (n) {
            case "apple" -> "Apple";
            case "banana" -> "Banana";
            case "melon" -> "Melon";
            case "lime" -> "Lime";
            default -> rawName;
        };
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase(Locale.ROOT);
    }
}
