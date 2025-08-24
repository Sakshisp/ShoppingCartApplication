package com.example.cart.pricing;


import com.example.cart.pricing.offers.BuyOneGetOneFree;
import com.example.cart.pricing.offers.Offer;
import com.example.cart.pricing.offers.ThreeForTwo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
@PropertySource("classpath:price-catalog.properties")
public class PriceCatalog {

    // prices from inline map in properties
    @Value("#{${prices}}")
    private Map<String, Integer> PRICES;

    // offer *types* from properties; default to {} if 'offers' is missing
    @Value("#{${offers:{}}}")
    private Map<String, String> OFFER_TYPES;

    // resolved strategies built from OFFER_TYPES
    private final Map<String, Offer> OFFERS = new HashMap<>();

    @PostConstruct
    void initOffers() {
        OFFERS.clear();
        OFFER_TYPES.forEach((k, v) -> OFFERS.put(normalize(k), toOffer(v)));
    }

    public int priceOf(String rawName) {
        Integer p = PRICES.get(normalize(rawName));
        if (p == null) throw new IllegalArgumentException("Unknown item: " + rawName);
        return p;
    }

    public Offer offerOf(String rawName) {
        // default: pay for every unit (no offer)
        return OFFERS.getOrDefault(normalize(rawName), count -> count);
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

    private Offer toOffer(String type) {
        if (type == null) return count -> count;

        return switch (type.trim().toUpperCase(Locale.ROOT)) {
            case "BOGO", "BUY_ONE_GET_ONE_FREE" -> new BuyOneGetOneFree();
            case "THREE_FOR_TWO", "3_FOR_2"     -> new ThreeForTwo();
            default                             -> (count -> count); // no offer
        };
    }
}
