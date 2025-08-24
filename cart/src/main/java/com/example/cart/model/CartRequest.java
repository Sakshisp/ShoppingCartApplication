package com.example.cart.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CartRequest(
        @NotNull @Size(min = 0)
        List<String> items
) {}
