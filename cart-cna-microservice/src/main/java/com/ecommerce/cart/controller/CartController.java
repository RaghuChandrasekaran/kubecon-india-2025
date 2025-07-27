package com.ecommerce.cart.controller;

import com.ecommerce.cart.service.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin
@RestController
@Tag(name = "Cart Controller", description = "API for managing shopping carts")
public class CartController {

    private static final Logger LOG = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    @RequestMapping("/")
    @Operation(summary = "Get API info", description = "Returns basic information about the Cart API")
    public String index() {
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
    @Operation(summary = "Create or update cart", description = "Creates a new cart or updates an existing one")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart created or updated successfully", 
                content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid cart data supplied", 
                content = @Content)
    })
    Mono<Void> addOrModifyCartItem(@RequestBody Mono<Cart> cart) {
        return cartService.addOrModifyCartItem(cart);
    }
}