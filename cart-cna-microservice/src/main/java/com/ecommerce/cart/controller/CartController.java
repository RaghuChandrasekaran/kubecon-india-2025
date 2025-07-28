package com.ecommerce.cart.controller;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.cart.service.TaxCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin
@RestController
@Tag(name = "Cart Controller", description = "API for managing shopping carts with GST tax calculation")
public class CartController {

    private static final Logger LOG = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;
    
    @Autowired
    private TaxCalculationService taxCalculationService;

    @GetMapping("/")
    public String indexPage() {
        return "{ \"name\": \"Cart API\", \"version\": 1.0.0} ";
    }

    @GetMapping("/cart")
    @Operation(summary = "List all carts", description = "Retrieves all shopping carts from the database")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of all carts", 
                content = @Content(schema = @Schema(implementation = Cart.class)))
    })
    public Flux<Cart> listCartData() {
        return cartService.listCartData();
    }


    @GetMapping("/cart/{customerId}")
    @Operation(summary = "Get cart by customer ID", description = "Retrieves a specific shopping cart by customer ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Found the cart", 
                content = @Content(schema = @Schema(implementation = Cart.class))),
        @ApiResponse(responseCode = "404", description = "Cart not found", 
                content = @Content)
    })
    public Mono<Cart> getCartById(@Parameter(description = "ID of the customer to retrieve cart for me") @PathVariable String customerId) {
        return cartService.getCartById(customerId);
    }

    @PostMapping("/cart")
    @Operation(summary = "Create or update cart", description = "Creates a new cart or updates an existing one with GST tax calculation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart created or updated successfully with tax calculations", 
                content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid cart data supplied", 
                content = @Content)
    })
    Mono<Void> addOrModifyCartItem(@RequestBody Mono<Cart> cart) {
        return cartService.addOrModifyCartItem(cart);
    }

    @GetMapping("/cart/{customerId}/tax-breakdown")
    @Operation(summary = "Get tax breakdown for cart", description = "Retrieves detailed GST tax breakdown for a specific cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tax breakdown calculated successfully", 
                content = @Content(schema = @Schema(implementation = TaxCalculationService.TaxBreakdown.class))),
        @ApiResponse(responseCode = "404", description = "Cart not found", 
                content = @Content)
    })
    public Mono<TaxCalculationService.TaxBreakdown> getTaxBreakdown(@Parameter(description = "ID of the customer to get tax breakdown for") @PathVariable String customerId) {
        return cartService.getCartById(customerId)
                .map(cart -> taxCalculationService.calculateTaxForCart(cart));
    }
}