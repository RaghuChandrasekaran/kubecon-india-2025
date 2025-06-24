package com.ecommerce.cart.model;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Schema(description = "Shopping cart information")
public class Cart {
    @Schema(description = "Customer ID associated with the cart", example = "customer123")
    private String customerId;
    
    @Schema(description = "List of items in the cart")
    private List<CartItem> items;
    
    @Schema(description = "Total price of all items in the cart", example = "145.0")
    private float total;
    
    @Schema(description = "Currency for the cart", example = "USD")
    private String currency;
}
