package com.example.cart.model;

import jakarta.validation.constraints.NotBlank;

public record AddItemRequest(
        @NotBlank String item
) {}
