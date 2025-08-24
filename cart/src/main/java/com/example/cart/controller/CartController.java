package com.example.cart.controller;

import com.example.cart.model.AddItemRequest;
import com.example.cart.model.CartRequest;
import com.example.cart.model.CartTotalResponse;
import com.example.cart.model.CartView;
import com.example.cart.model.CartLine;
import com.example.cart.service.ShoppingCartService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = {"Authorization", "Content-Type", "X-User-Id"},
        exposedHeaders = {"Authorization"}
)

@RestController
@RequestMapping(value = "/api/cart", produces = MediaType.APPLICATION_JSON_VALUE)
public class CartController {

    private final ShoppingCartService service;

    // super-simple in-memory store: X-User-Id -> list of item names
    private final Map<String, List<String>> carts = new ConcurrentHashMap<>();

    public CartController(ShoppingCartService service) {
        this.service = service;
    }

    private String userIdFromHeaderOrDefault(String header) {
        return (header == null || header.isBlank()) ? "anon" : header;
    }

    private List<String> getCart(String userId) {
        return carts.computeIfAbsent(userId, _k -> new ArrayList<>());
    }

    /** GET /api/cart — return current cart for the user */
    @GetMapping
    public CartView view(@RequestHeader(value = "X-User-Id", required = false) String userHeader) {
        String userId = userIdFromHeaderOrDefault(userHeader);
        List<String> cart = List.copyOf(getCart(userId));
        return new CartView(cart, cart.size());
    }

    /** POST /api/cart/items — add one item to cart */
    @PostMapping(value = "/items", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CartView addItem(@RequestHeader(value = "X-User-Id", required = false) String userHeader,
                            @Valid @RequestBody AddItemRequest req) {
        String userId = userIdFromHeaderOrDefault(userHeader);
        List<String> cart = getCart(userId);
        cart.add(req.item().trim());
        return new CartView(List.copyOf(cart), cart.size());
    }

    /** DELETE /api/cart/items/{item} — remove one matching item */
    @DeleteMapping("/items/{item}")
    public CartView removeItem(@RequestHeader(value = "X-User-Id", required = false) String userHeader,
                               @PathVariable String item) {
        String userId = userIdFromHeaderOrDefault(userHeader);
        List<String> cart = getCart(userId);
        for (int i = 0; i < cart.size(); i++) {
            if (cart.get(i).equalsIgnoreCase(item)) {
                cart.remove(i);
                break;
            }
        }
        return new CartView(List.copyOf(cart), cart.size());
    }

    /** DELETE /api/cart — clear the cart */
    @DeleteMapping
    public void clear(@RequestHeader(value = "X-User-Id", required = false) String userHeader) {
        String userId = userIdFromHeaderOrDefault(userHeader);
        carts.put(userId, new ArrayList<>());
    }

    /**
     * POST /api/cart/total — price the cart
     * If body has items -> price those (ad-hoc).
     * Else -> price the stored cart for the user.
     */
    @PostMapping(value = "/total", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CartTotalResponse total(@RequestHeader(value = "X-User-Id", required = false) String userHeader,
                                   @RequestBody(required = false) CartRequest request) {
        String userId = userIdFromHeaderOrDefault(userHeader);
        List<String> items = (request != null && request.items() != null) ? request.items() : getCart(userId);

        // Service should return total in pence + line items
        int totalPence = service.calculateTotalPence(items);
        List<CartLine> lines = service.calculateLines(items);

        // Build response using static factory
        return CartTotalResponse.ofPence("GBP", totalPence, lines);
    }
}
