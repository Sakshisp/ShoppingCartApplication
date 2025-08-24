package com.example.cart.service;

import com.example.cart.model.CartLine;
import com.example.cart.pricing.PriceCatalog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static java.util.List.of;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(
        classes = {
                // minimal context: just the bean we need
                PriceCatalog.class
        }
)
// ensure the property file is on the classpath for the test
@TestPropertySource(locations = {
        "classpath:price-catalog.properties",
})
class ShoppingCartServiceTest {

    @Autowired
    private PriceCatalog priceCatalog;

    private ShoppingCartService service;

    @BeforeEach
    void setUp() {
        this.service = new ShoppingCartService(priceCatalog);
    }

    @Test
    @DisplayName("Empty basket -> total 0p and no lines")
    void emptyBasket() {
        assertEquals(0, service.calculateTotalPence(List.of()));
        assertTrue(service.calculateLines(List.of()).isEmpty());
    }

    @Test
    @DisplayName("Simple per-item pricing (no offers)")
    void simplePricing() {
        assertEquals(35, service.calculateTotalPence(of("Apple")));
        assertEquals(105, service.calculateTotalPence(of("Apple", "Apple", "Apple")));
        assertEquals(60, service.calculateTotalPence(of("Banana", "Banana", "Banana")));
    }

    @Test
    @DisplayName("Melon BOGOF: pay for ceil(n/2)")
    void melonBogof() {
        assertEquals(50,  service.calculateTotalPence(of("Melon")));
        assertEquals(50,  service.calculateTotalPence(of("Melon", "Melon")));
        assertEquals(100, service.calculateTotalPence(of("Melon", "Melon", "Melon")));
        assertEquals(100, service.calculateTotalPence(of("Melon", "Melon", "Melon", "Melon")));
        assertEquals(50,  service.calculateTotalPence(of("melon"))); // case-insensitive
    }

    @Test
    @DisplayName("Lime 3-for-2: pay for n - floor(n/3)")
    void limeThreeForTwo() {
        assertEquals(15, service.calculateTotalPence(of("Lime")));
        assertEquals(30, service.calculateTotalPence(of("Lime", "Lime")));
        assertEquals(30, service.calculateTotalPence(of("Lime", "Lime", "Lime")));                 // pay 2
        assertEquals(45, service.calculateTotalPence(of("Lime", "Lime", "Lime", "Lime")));         // pay 3
        assertEquals(60, service.calculateTotalPence(of("Lime", "Lime", "Lime", "Lime", "Lime"))); // pay 4
        assertEquals(60, service.calculateTotalPence(of("Lime", "Lime", "Lime", "Lime", "Lime", "Lime"))); // pay 4
    }

    @Test
    @DisplayName("Mixed basket -> correct total and stable line order")
    void mixedBasket() {
        List<String> basket = of(
                "Apple","Apple","Banana",
                "Melon","Melon","Melon",
                "Lime","Lime","Lime","Lime"
        );

        // 2 Apples = 70, 1 Banana = 20, 3 Melons => pay 2 = 100, 4 Limes => pay 3 = 45 => total 235
        assertEquals(235, service.calculateTotalPence(basket));

        List<CartLine> lines = service.calculateLines(basket);
        assertEquals(4, lines.size());

        CartLine apple = lines.get(0);
        assertEquals("Apple", apple.item());
        assertEquals(2, apple.qty());
        assertEquals(2, apple.chargeableQty());
        assertEquals(35, apple.unitPricePence());
        assertEquals(70, apple.lineTotalPence());

        CartLine banana = lines.get(1);
        assertEquals("Banana", banana.item());
        assertEquals(1, banana.qty());
        assertEquals(1, banana.chargeableQty());
        assertEquals(20, banana.unitPricePence());
        assertEquals(20, banana.lineTotalPence());

        CartLine melon = lines.get(2);
        assertEquals("Melon", melon.item());
        assertEquals(3, melon.qty());
        assertEquals(2, melon.chargeableQty()); // BOGO
        assertEquals(50, melon.unitPricePence());
        assertEquals(100, melon.lineTotalPence());

        CartLine lime = lines.get(3);
        assertEquals("Lime", lime.item());
        assertEquals(4, lime.qty());
        assertEquals(3, lime.chargeableQty()); // 3-for-2
        assertEquals(15, lime.unitPricePence());
        assertEquals(45, lime.lineTotalPence());
    }

    @Test
    @DisplayName("Unknown item -> throws IllegalArgumentException")
    void unknownItem() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> service.calculateTotalPence(of("Orange"))
        );
        assertTrue(ex.getMessage().toLowerCase().contains("unknown item"));
    }
}
