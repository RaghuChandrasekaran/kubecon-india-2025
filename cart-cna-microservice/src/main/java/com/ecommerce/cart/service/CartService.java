package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class CartService {

    private static final Logger LOG = LoggerFactory.getLogger(CartService.class);

    private ReactiveRedisTemplate<String, Cart> redisTemplate;

    private ReactiveValueOperations<String, Cart> cartOps;

    CartService(ReactiveRedisTemplate<String, Cart> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.cartOps = this.redisTemplate.opsForValue();
    }

    public Flux<Cart> listCartData() {
        return redisTemplate.keys("*")
                .flatMap(cartOps::get);
    }

    public Mono<Cart> getCartById(String customerId){
        return cartOps.get(customerId);
    }

    public Mono<Void> addOrModifyCartItem(Mono<Cart> cart) {
        LOG.info("Cart Action triggered");

        return cart.flatMap(c -> {
            LOG.info("Adding cart to Redis: {}", c);

            if (c.getCustomerId() == null) {
                LOG.error("Customer Id is missing.");
                return Mono.error(new IllegalArgumentException("Customer Id is missing."));
            }

            float total = 0;
            for (CartItem item : c.getItems()) {
                total += item.getPrice() * item.getQuantity();
            }
            c.setTotal(total);

            return cartOps.set(c.getCustomerId(), c).then(); // Propagate this operation
        });
    }

    public Mono<Boolean> deleteCartItemById(String customerId) {
        return cartOps.delete(customerId);
    }

}
