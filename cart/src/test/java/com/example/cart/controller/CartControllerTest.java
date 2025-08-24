package com.example.cart.controller;

import com.example.cart.ShoppingCartApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ShoppingCartApplication.class)
@AutoConfigureMockMvc
class CartControllerTest {

    @Autowired MockMvc mvc;

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void totalsEndpointWorks() throws Exception {
        String body = """
            {"items":["Apple","Apple","Banana","Melon","Melon","Melon","Lime","Lime","Lime","Lime"]}
            """;
        mvc.perform(post("/api/cart/total")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPence", is(235)))
                .andExpect(jsonPath("$.totalFormatted", is("£2.35")));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void badItemReturns400() throws Exception {
        String body = """
            {"items":["Orange"]}
            """;
        mvc.perform(post("/api/cart/total")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Unknown item")));
    }
}
