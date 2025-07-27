package com.ecommerce.cart;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.model.ProductCategory;
import com.ecommerce.cart.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = CartApplication.class)
public class CartServiceIT {

    @Autowired
    private CartService cartService;

    @BeforeEach
    public void clearRedis() {
        cartService.listCartData()
                .doOnNext(cart -> cartService.deleteCartItemById(cart.getCustomerId()))
                .then()
                .block();
    }

    private CartItem getCartItem(String title, int quantity, float price) {
        String productId = "688301f018fd1500205df8ba";
        String sku = "sku-0uh7iazcu";
        return new CartItem(productId, sku, title, ProductCategory.GENERAL, quantity, price, String.valueOf(price), null);
    }

    private Cart getShoppingCart(String customerId, List<CartItem> items) {
        return new Cart(customerId, items, 0, 0, 0, "$");
    }

    @Test
    public void shouldAddCartAndRetrieveById() {
        Cart cart = getShoppingCart("ajay", List.of(getCartItem("Evening Pumps", 3, 50.0f)));
        cartService.addOrModifyCartItem(Mono.just(cart)).block();

        Cart result = cartService.getCartById("ajay").block();
        assertNotNull(result);
        assertEquals("ajay", result.getCustomerId());
        assertEquals(150.0f, result.getSubtotal()); // 3 * 50.0
        assertEquals(1, result.getItems().size());
        assertEquals("Evening Pumps", result.getItems().get(0).getTitle());
    }

    @Test
    public void listCartDataShouldReturnAllInsertedCarts() {
        Cart cart1 = getShoppingCart("custA", List.of(getCartItem("Sneakers", 2, 75.0f)));
        Cart cart2 = getShoppingCart("custB", List.of(getCartItem("Backpack", 1, 120.0f)));

        cartService.addOrModifyCartItem(Mono.just(cart1)).block();
        cartService.addOrModifyCartItem(Mono.just(cart2)).block();

        List<Cart> carts = cartService.listCartData().collectList().block();
        assertNotNull(carts);
        Cart cartA = carts.stream().filter(c -> c.getCustomerId().equals("custA")).findFirst().orElse(null);
        Cart cartB = carts.stream().filter(c -> c.getCustomerId().equals("custB")).findFirst().orElse(null);

        assertNotNull(cartA);
        assertEquals(150.0f, cartA.getSubtotal()); // 2 * 75.0
        assertNotNull(cartB);
        assertEquals(120.0f, cartB.getSubtotal());
    }

    @Test
    public void addCartWithMissingCustomerIdShouldNotSave() {
        Cart cart = new Cart(); // No customerId
        cart.setItems(List.of(getCartItem("item1", 1, 100.0f)));

        assertThrows(IllegalArgumentException.class, () -> {
            cartService.addOrModifyCartItem(Mono.just(cart)).block();
        });
    }
}
