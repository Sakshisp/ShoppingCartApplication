package com.example.cart.service;

import com.example.cart.model.CartLine;
import com.example.cart.pricing.offers.Offer;
import com.example.cart.pricing.PriceCatalog;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShoppingCartService {

    private final PriceCatalog catalog;

    public ShoppingCartService(PriceCatalog catalog) {
        this.catalog = catalog;
    }

    /**
     * Returns the detailed line items for the given basket.
     * - Validates items (throws IllegalArgumentException for unknowns)
     * - Applies offers (e.g., BOGOF, 3-for-2)
     * - Prices are in MINOR units (pence)
     */
    public List<CartLine> calculateLines(List<String> items) {
        if (items == null) items = List.of();

        // Count items (keep insertion order stable)
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String raw : items) {
            // validate item (throws if unknown)
            catalog.priceOf(raw);

            String canonical = catalog.canonical(raw);
            counts.merge(canonical, 1, Integer::sum);
        }

        List<CartLine> lines = new ArrayList<>();
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            String item = e.getKey();
            int qty = e.getValue();

            int unitPricePence = catalog.priceOf(item); // in pence
            Offer offer = catalog.offerOf(item);
            int chargeableQty = offer.chargeableQuantity(qty);

            int lineTotalPence = chargeableQty * unitPricePence;

            lines.add(new CartLine(
                    item,
                    qty,
                    chargeableQty,
                    unitPricePence,
                    lineTotalPence
            ));
        }

        return lines;
    }

    /**
     * Returns the grand total (in pence) for the given basket.
     * Delegates to calculateLines(...) and sums line totals.
     */
    public int calculateTotalPence(List<String> items) {
        int total = 0;
        for (CartLine line : calculateLines(items)) {
            total += line.lineTotalPence();
        }
        return total;
    }
}
